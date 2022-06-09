import { rollup } from 'rollup'
import fs from 'fs'
import { transform } from '@swc/core'
import yaml from 'yaml'
import { universalInput, universalOutput, getUniversalPlugins, PRESET_FORMAT } from './common/universal-conf'
import { mayBeConfig, isPlainObject, serialize, loadModule } from './common/utils'
import { exist, readJson } from './common/fs'
import type {
  BumpOptions,
  RollupOptions,
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

export const build = (options?: BumpOptions) =>
  buildImpl(options).catch((err) => {
    print.danger(err.message)
    process.exit(1)
  })

export const resolveUserConfig = async (): Promise<BumpOptions> => {
  try {
    let filePath = ''
    for (const p of mayBeConfig) {
      const full = path.resolve(process.cwd(), p)
      if (await exist(full)) {
        filePath = full
        break
      }
    }
    //   we can resolve yaml conf
    const file = await fs.promises.readFile(filePath, 'utf-8')
    if (['.yaml', '.yml'].includes(path.extname(filePath))) {
      return yaml.parse(file) as BumpOptions
    }
    //   javaScript or typeScript lang.
    const { code } = await transform(file, {
      filename: filePath,
      isModule: 'unknown',
      sourceMaps: false,
      module: {
        type: 'commonjs'
      }
    })
    return await loadConfigFromBundledFile(filePath, code)
  } catch (error) {
    throw new Error('Please entry uesr config')
  }
}

const defaultExternal = async () => {
  const tar = path.join(process.cwd(), 'package.json')
  const { dependencies, peerDependencies } = await readJson(tar)
  return Object.keys({ ...dependencies, ...peerDependencies })
}

const buildImpl = async (options?: BumpOptions) => {
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
  optionImpl.output!.format = format

  if (optionImpl.output?.dts) {
    // Tips: when enable this option. We need to determine if the user has typescript installed
    if (!loadModule('typescript')) {
      optionImpl.output.dts = false
      print.log(
        '[Bump]: If you want to generate declaration file you should insatll typescript in your project and write with typescript :)'
      )
    } else {
      const dts = loadModule('rollup-plugin-dts')
    }
  }
  const presetPlugin = getUniversalPlugins(optionImpl.output)
  try {
    await runImpl(optionImpl, presetPlugin)
  } catch (error) {
    throw error
  }

  //   // @ts-ignore
  //   formats = Array.isArray(formats) ? formats : [formats]

  //   if (formats?.includes('umd') && isPlainObject(optionImpl?.output)) {
  //     const hasName = Boolean((optionImpl.output as RollupOutputOptions).name)
  //     if (!hasName) {
  //       // @ts-ignore
  //       formats = formats.filter((format) => format !== 'umd')
  //       print.tip("[Bump]: Can'found name with umd format.Please check it exist.")
  //     }
  //   }

  //   try {
  //     const bundle = await rollup({
  //       input: optionImpl.input,
  //       // @ts-nocheck
  //       plugins: optionImpl.plugins,
  //       external: optionImpl.external
  //     })

  //     await Promise.all(
  //       (formats as ModuleFormat[]).map((format) =>
  //         bundle.write({
  //           dir: getDestPath(format),
  //           format,
  //           exports: 'auto'
  //         })
  //       )
  //     )

  //     // if (options?.output?.dts) {
  //     //   const inputs = Array.isArray(optionImpl.input)
  //     //     ? optionImpl.input
  //     //     : isPlainObject(optionImpl.input)
  //     //     ? serialize(optionImpl.input as Record<string, string>)
  //     //     : [optionImpl.input as string]

  //     //   const bundle = await rollup({
  //     //     input: inputs,
  //     //     plugins: [dts()]
  //     //   })
  //     //   bundle.write({
  //     //     dir: 'types'
  //     //   })
  //     // }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       print.danger(error.message)
  //       process.exit(1)
  //     }
  //   }
}

/**
 * @description runImp is use for buildImpl .for future version i plan to add watch
 * API so needs to realized.
 */

const runImpl = async (optionImpl: BumpOptions, presetPlugins: Record<string, RollupPlugin>) => {
  console.log(optionImpl)
  let { input } = optionImpl
  if (!Array.isArray(input) && !isPlainObject(input)) input = [(input as string) || universalInput]
  if (isPlainObject(input)) input = serialize(input as Record<string, any>)
  if (!input?.length) input = [universalInput]
  console.log(input)
  //   try {
  //     const bundle = await rollup({})
  //     await bundle.write()
  //   } catch (error) {
  //     throw error
  //   }
  const { format } = optionImpl.output!
  console.log(format)
  const plugins = new Set([serialize(presetPlugins), optionImpl.plugins])
  console.log(plugins)
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
  source: string[]
  format: ModuleFormat
  config: BumpOptions
}

/**
 * @description generator rollup bundle config for input and output
 */
const generatorRollupConfig = async (): Promise<RollupOptions> => {
  return {
    //
  }
}

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

const loadConfigFromBundledFile = async (fileName: string, bundledCode: string): Promise<BumpOptions> => {
  const extension = path.extname(fileName)
  const defaultLoader = require.extensions[extension]!
  require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === fileName) {
      ;(module as NodeModuleWithCompile)._compile(bundledCode, filename)
    } else {
      defaultLoader(module, filename)
    }
  }
  delete require.cache[require.resolve(fileName)]
  const raw = require(fileName)
  const config = raw.__esModule ? raw.default : raw
  require.extensions[extension] = defaultLoader
  return config
}
