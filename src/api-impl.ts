import { rollup } from 'rollup'
import fs from 'fs'
import { transform } from '@swc/core'
import yaml from 'yaml'
import { universalInput, universalOutput, getUniversalPlugins, PRESET_FORMAT } from './common/universal-conf'
import { mayBeConfig, isPlainObject, serialize } from './common/utils'
import { exist, readJson } from './common/fs'
import type { BumpOptions, RollupOptions, ModuleFormat, RollupOutputOptions } from './common/interface'
import path from 'path'
import { print } from './common/logger'
// import dts from 'rollup-plugin-dts'
import merge from 'lodash.merge'
/**
 *@description dine bump config.
 */
export const define = (options?: BumpOptions) => options

export const build = (options?: BumpOptions) => buildImpl(options)

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
    throw new Error('Please entry uer config')
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
    try {
      if (!isPlainObject(options)) throw new Error('[Bump]: please set an object config')
      optionImpl = parserOptions(optionImpl, options)
    } catch (error) {
      if (error instanceof Error) print.danger(error.message)
      process.exit(1)
    }
  }
  let format = optionImpl.output?.format
  if (!format) format = PRESET_FORMAT
  if (format.length === 0) format = PRESET_FORMAT

  const presetPlugin = getUniversalPlugins(optionImpl.output)

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
 *@description Parser user options and preset options
 */
const parserOptions = (defaultOptions: BumpOptions, userOptions: BumpOptions): BumpOptions => {
  if (!Object.keys(userOptions)) return defaultOptions
  const options = Object.assign({}, defaultOptions, userOptions, {
    output: merge({}, defaultOptions.output, userOptions.output),
    plugins: merge({}, defaultOptions.plugins, userOptions.plugins)
  })

  return options
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
