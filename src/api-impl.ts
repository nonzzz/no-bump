import * as rollup from 'rollup'
import { universalInput, universalOutput, PRESET_FORMAT } from './common/universal-conf'
import { isPlainObject, serialize, loadModule, omit, len } from './common/utils'
import { readJson } from './common/fs'
import type {
  BumpOptions,
  ModuleFormat,
  RollupOutputOptions,
  RollupPlugin,
  RollupInputOption
} from './common/interface'
import path from 'path'
import { print, throwInvalidateError } from './common/logger'
import merge from 'lodash.merge'
import { parserPlugins } from './common/plugin'

/**
 *@description dine bump config.
 */
export const define = (options?: BumpOptions) => options

/**
 *@description create a bundle configuration exports watch and build api
 *@deprecated Warn:This API isn't expected. Will be removed in future. Please use `build` and `watch` instead.
 */
export const createBundle = (options?: Omit<BumpOptions, 'input' | 'output'>) => {
  return {
    build(conf?: Pick<BumpOptions, 'input' | 'output'>) {
      return buildImpl(merge(conf, options), {
        watch: false
      })
    },
    watch(conf?: Pick<BumpOptions, 'input' | 'output'>) {
      return buildImpl(merge(conf, options), {
        watch: true
      })
    }
  }
}

/**
 * ExtraOptions only use for bump internal configs.
 * I don't want expose too many details to user.
 */

export const build = (options?: BumpOptions) => buildImpl(options)

export const watch = (options?: BumpOptions) => buildImpl(options, { watch: true })

const defaultExternal = async () => {
  const tar = path.join(process.cwd(), 'package.json')
  const { dependencies, peerDependencies } = await readJson(tar)
  return Object.keys({ ...dependencies, ...peerDependencies })
}

const buildImpl = async (options?: BumpOptions, extraOptions?: Record<string, unknown>) => {
  const external = await defaultExternal()
  let optionImpl: BumpOptions = {
    input: universalInput,
    output: universalOutput,
    external
  }
  if (options) {
    if (!isPlainObject(options)) throw throwInvalidateError('[Bump]: please set an object config')
    optionImpl = parserOptions(optionImpl, options)
  }
  const getFormat = (userForamt?: ModuleFormat | ModuleFormat[] | undefined): ModuleFormat[] => {
    if (!userForamt || (Array.isArray(userForamt) && !len(userForamt))) return PRESET_FORMAT
    return Array.isArray(userForamt) ? userForamt : [userForamt]
  }

  const unite = (formats: ModuleFormat[]) => {
    return formats.map((item) => {
      if (item === 'commonjs') return 'cjs'
      if (item === 'es') return 'esm'
      return item
    })
  }

  optionImpl.output = {
    ...optionImpl.output,
    format: unite(getFormat(optionImpl.output?.format))
  }

  /**
   * Because dts plugin will overwrites the out. so we
   * only change value of dts to judge we should or not
   * load the dts module plugin.
   */
  if (optionImpl.output?.dts) {
    if (!loadModule('typescript')) {
      optionImpl.output.dts = false
      print.log(
        '[Bump]: If you want to generate declaration file you should insatll typescript in your project and write with typescript :)'
      )
    }
  }

  const plugins = parserPlugins({
    userPlugins: optionImpl?.plugins,
    internalPluginsOptions: optionImpl.internalOptions?.plugins ?? optionImpl.internalPlugins,
    options: merge({}, optionImpl.output, { resolve: optionImpl.resolve })
  })

  try {
    await runImpl(optionImpl, plugins, extraOptions)
  } catch (error) {
    throw error
  }
}

/**
 * extraOptions only use with internal.
 */

const runImpl = async (optionImpl: BumpOptions, plugins: RollupPlugin[], extraOptions?: Record<string, unknown>) => {
  let { input } = optionImpl
  if (!Array.isArray(input) && !isPlainObject(input)) input = [(input as string) || universalInput]
  if (isPlainObject(input)) input = serialize(input as Record<string, any>)
  if (!len(input)) input = [universalInput]
  const formats = optionImpl.output!.format as ModuleFormat[]

  /**
   * Input parseing rules.
   * We should translate user input as array. when user define a object array. we think it's mulitple
   * tasks mulit-entry.
   */

  const inputs = input as string[]
  const tasks: Array<{
    getConfig(): GeneratorResult
  }> = []

  const generatorTasks = (plugins: RollupPlugin[], cb?: (origin: GeneratorResult) => GeneratorResult) => {
    inputs.forEach((source) => {
      formats.forEach((format) => {
        tasks.push({
          getConfig() {
            const rollupConfig = generatorRollupConfig({
              source,
              format,
              config: optionImpl,
              plugins
            })
            return cb ? cb(rollupConfig) : rollupConfig
          }
        })
      })
    })
  }

  generatorTasks(plugins)

  /**
   * TODO: I have'nt had a good soulution for generating type declaration file.
   */

  if (optionImpl.output?.dts) {
    const dts = () => {
      const load = loadModule('rollup-plugin-dts')
      if (!load) {
        print.tip('[Bump]: please install rollup-plugin-dts.')
        return []
      }
      return [load()]
    }
    generatorTasks(dts(), (conf) => ({
      inputConfig: conf.inputConfig,
      outputConfig: omit(conf.outputConfig, ['entryFileNames'])
    }))
  }

  if (extraOptions?.watch) {
    const watchConfigs = tasks.map((task) => {
      const { inputConfig, outputConfig } = task.getConfig()
      return {
        ...inputConfig,
        output: outputConfig,
        watch: {}
      }
    })
    const watcher = rollup.watch(watchConfigs)
    watcher.on('event', (e) => {
      if (e.code === 'ERROR') {
        print.danger(e.error.message)
      }
    })
  } else {
    await Promise.all(
      tasks.map(async (task) => {
        const { inputConfig, outputConfig } = task.getConfig()
        const bundle = await rollup.rollup(inputConfig)
        await bundle.write(outputConfig)
      })
    )
  }
}

/**
 *@description Parser user options and preset options
 */
const parserOptions = (defaultOptions: BumpOptions, userOptions: BumpOptions): BumpOptions => {
  if (!Object.keys(userOptions)) return defaultOptions
  const options = Object.assign({}, defaultOptions, userOptions, {
    output: merge({}, defaultOptions.output, userOptions.output)
  })

  return options
}

interface GeneratorRollupConfig {
  source: string
  format: ModuleFormat
  config: BumpOptions
  plugins: RollupPlugin[]
}

interface GeneratorResult {
  inputConfig: {
    input: RollupInputOption
    plugins: RollupPlugin[]
    external: any
  }
  outputConfig: RollupOutputOptions
}

/**
 * @description generator rollup bundle config for input and output
 */
const generatorRollupConfig = (originalConfig: GeneratorRollupConfig): GeneratorResult => {
  const { source, format, config, plugins } = originalConfig

  const fileNameRule = '[name].[format][min][ext]'
  const fileName = config.output?.file || fileNameRule

  let fileNameTemplate =
    typeof fileName === 'function'
      ? fileName({ format, minify: Boolean(config.output?.minifiy) }, fileNameRule)
      : fileName
  fileNameTemplate = fileNameTemplate
    .replace(/\[min\]/, config.output?.minifiy ? '.min' : '')
    .replace(/\[ext\]/, '.js')
    .replace(/\[format\]/, format)

  return {
    inputConfig: {
      input: source,
      plugins,
      external: config.external!
    },
    outputConfig: {
      format,
      exports: config.output?.exports,
      entryFileNames: fileNameTemplate,
      dir: config.output?.dir,
      sourcemap: config.output?.sourceMap,
      globals: config.global,
      name: config.output?.name,
      preserveModules: config.output?.preserveModules,
      preserveModulesRoot: config.output?.preserveModulesRoot
    }
  }
}
