import { rollup, watch } from 'rollup'
import { universalInput, universalOutput, getUniversalPlugins, PRESET_FORMAT } from './common/universal-conf'
import { isPlainObject, serialize, loadModule, omit } from './common/utils'
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

/**
 *@description dine bump config.
 */
export const define = (options?: BumpOptions) => options

/**
 *@description create a bundle configuration exports watch and build api
 * Example:
 *  plugins: `Record<string,RollupPlugin>`
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

export const build = (options?: BumpOptions) =>
  buildImpl(options).catch((err) => {
    print.danger(err.message)
    process.exit(1)
  })

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
  let format = optionImpl.output?.format
  if (!format) format = PRESET_FORMAT
  if (format.length === 0) format = PRESET_FORMAT
  optionImpl.output!.format = Array.isArray(format) ? format : [format]
  const presetPlugin = {}
  if (!extraOptions) {
    Object.assign(presetPlugin, getUniversalPlugins(optionImpl.output, optionImpl?.internalPlugins))
    /**
     * Because dts plugin will overwrites the out. so we
     * only change value of dts to judge we should or not
     * load the dts module plugin.
     */
    if (optionImpl.output?.dts) {
      // Tips: when enable this option. We need to determine if the user has typescript installed
      if (!loadModule('typescript')) {
        optionImpl.output.dts = false
        print.log(
          '[Bump]: If you want to generate declaration file you should insatll typescript in your project and write with typescript :)'
        )
      }
    }
  }

  try {
    await runImpl(optionImpl, presetPlugin, extraOptions)
  } catch (error) {
    throw error
  }
}

/**
 * @description runImp is use for buildImpl .for future version i plan to add watch
 * API so needs to realized.
 */

const runImpl = async (
  optionImpl: BumpOptions,
  presetPlugins: Record<string, RollupPlugin>,
  extraOptions?: Record<string, unknown>
) => {
  let { input } = optionImpl
  if (!Array.isArray(input) && !isPlainObject(input)) input = [(input as string) || universalInput]
  if (isPlainObject(input)) input = serialize(input as Record<string, any>)
  if (!input?.length) input = [universalInput]
  const formats = optionImpl.output!.format as ModuleFormat[]
  //   user can customlize the plugin sequence.
  const plugins = {
    ...presetPlugins
  }

  //   hack: Rollup plugin or Vite plugin must have named.
  if (optionImpl.plugins && isPlainObject(optionImpl.plugins)) {
    for (const name in optionImpl.plugins) {
      let plugin = optionImpl.plugins[name]
      if (typeof plugin === 'function') plugin = (plugin as Function).call(plugin)
      if (isPlainObject(plugin) && !plugin.name)
        throw throwInvalidateError(`[Bump]: Plugin ${name} not a standard rollup or vite plugin.`)
      Object.assign(plugins, { [name]: plugin })
    }
  }
  /**
   * Input parseing rules.
   * We should translate user input as array. when user define a object array. we think it's mulitple
   * tasks mulit-entry.
   */

  const inputs = input as string[]
  const tasks = []
  for (const source of inputs) {
    for (const format of formats) {
      tasks.push({
        getConfig() {
          const rollupConfig = generatorRollupConfig({
            source,
            format,
            config: optionImpl,
            plugins
          })
          return rollupConfig
        }
      })
    }
  }
  if (optionImpl.output?.dts && !extraOptions) {
    const dts = loadModule('rollup-plugin-dts')()
    const plugins = [dts]
    // I should get all entryFileNames as input chunk.
    await Promise.all(
      tasks.map(async (task) => {
        const { inputConfig, outputConfig } = task.getConfig() as GeneratorResult
        const bundle = await rollup({
          ...inputConfig,
          plugins
        })
        await bundle.write(omit(outputConfig, ['entryFileNames']))
      })
    )
  }
  if (extraOptions?.watch) {
    const configs = await Promise.all(
      tasks.map(async (task) => {
        const { inputConfig, outputConfig } = task.getConfig() as GeneratorResult
        return {
          ...inputConfig,
          output: outputConfig,
          watch: {}
        }
      })
    )
    const watcher = watch(configs)
    watcher.on('event', (e) => {
      if (e.code === 'ERROR') {
        print.danger(e.error.message)
      }
    })
  } else {
    await Promise.all(
      tasks.map(async (task) => {
        const { inputConfig, outputConfig } = task.getConfig() as GeneratorResult
        const bundle = await rollup(inputConfig)
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
  plugins: Record<string, RollupPlugin>
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
      plugins: serialize(plugins),
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
