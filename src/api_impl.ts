import { rollup } from 'rollup'
import fs from 'fs'
import { transform } from '@swc/core'
import yaml from 'yaml'
import { universalInput, universalOutput, getUniversalPlugins } from './common/universal-conf'
import { mayBeConfig, omit, isPlainObject, serialize, pick } from './common/utils'
import { exist, readJson } from './common/fs'
import type { BumpOptions, RollupOptions, ModuleFormat, RollupOutputOptions, RollupPlugin } from './common/interface'
import path from 'path'
import { print } from './common/logger'
import dts from 'rollup-plugin-dts'
/**
 * dine config typings.
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
  let optionImpl: RollupOptions = {
    input: universalInput,
    plugins: serialize(getUniversalPlugins(options?.output?.minifiy)),
    output: { ...omit(universalOutput, ['format']) },
    external
  }

  try {
    if (!isPlainObject(options)) throw new Error('[Bump]: please set an object config')
    optionImpl = parserOptions(optionImpl, options!)
  } catch (error) {
    if (error instanceof Error) print.danger(error.message)
    process.exit(1)
  }

  let { format: formats } = options?.output?.format
    ? pick(options.output, ['format'])
    : pick(universalOutput, ['format'])

  // @ts-ignore
  formats = Array.isArray(formats) ? formats : [formats]

  if (formats?.includes('umd') && isPlainObject(optionImpl?.output)) {
    const hasName = Boolean((optionImpl.output as RollupOutputOptions).name)
    if (!hasName) {
      // @ts-ignore
      formats = formats.filter((format) => format !== 'umd')
      print.tip("[Bump]: Can'found name with umd format.Please check it exist.")
    }
  }

  const getDestPath = (sub: string) => {
    const { output } = optionImpl as BumpOptions
    if (Array.isArray(optionImpl.input) || isPlainObject(optionImpl.input)) {
      if (output?.dir) return path.join(output.dir, sub)
      throw new Error("[Bump]: when you're use multiple input. You should set dir :)")
    }
    if (output?.file) return output.file
    throw new Error('[Bump]: Please check you output file conf.')
  }

  try {
    const bundle = await rollup({
      input: optionImpl.input,
      // @ts-nocheck
      plugins: optionImpl.plugins,
      external: optionImpl.external
    })

    await Promise.all(
      (formats as ModuleFormat[]).map((format) =>
        bundle.write({
          dir: getDestPath(format),
          format,
          exports: 'auto'
        })
      )
    )

    if (options?.output?.dts) {
      const inputs = Array.isArray(optionImpl.input)
        ? optionImpl.input
        : isPlainObject(optionImpl.input)
        ? serialize(optionImpl.input as Record<string, string>)
        : [optionImpl.input as string]

      const bundle = await rollup({
        input: inputs,
        plugins: [...optionImpl.plugins!, dts()]
      })
      bundle.write({
        dir: 'types'
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      print.danger(error.message)
      process.exit(1)
    }
  }
}

const parserOptions = (defaultOptions: RollupOptions, userOptions: BumpOptions): RollupOptions => {
  if (!Object.keys(userOptions)) return defaultOptions
  if (userOptions.output?.format) delete userOptions.output.format
  const options = {
    ...defaultOptions,
    ...userOptions
  }
  //   set input
  if (!userOptions.input) {
    options.input = defaultOptions.input
  }
  //   set plugin
  if (!userOptions.output) {
    options.output = defaultOptions.output
  }
  if (!userOptions.plugins) {
    options.plugins = defaultOptions.plugins
  }
  if (userOptions.preset) {
    delete options?.preset
    options.plugins = [...options.plugins!]
  }
  return options as any
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

const loadPreset = (path: string): RollupPlugin[] => {
  delete require.cache[require.resolve(path)]
  const { plugins } = require(path)
  if (plugins) return plugins
  return []
}
