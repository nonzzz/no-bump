import { rollup } from 'rollup'
import fs from 'fs'
import { transform } from '@swc/core'
import yaml from 'yaml'
import { universalInput, universalOutput, getUniversalPlugins } from './common/universal-conf'
import { mayBeConfig, omit, isPlainObject, serialize, pick } from './common/utils'
import { exist } from './common/fs'
import type { BumpOptions, RollupOptions } from './common/interface'
import path from 'path'
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
    if (['yaml', 'yml'].includes(filePath)) {
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

const buildImpl = async (options?: BumpOptions) => {
  const optionImpl: RollupOptions = {
    input: universalInput,
    output: { ...omit(universalOutput, ['format']), plugins: serialize(getUniversalPlugins()) }
  }
  if (isPlainObject(options)) {
    const userOutputOptions = options?.output?.format ? omit(options.output, ['format']) : options?.output
    Object.assign(optionImpl, {
      input: options?.input,
      output: {
        plugins: userOutputOptions?.plugins ?? serialize(getUniversalPlugins())
      }
    })
  }
  let { format: formats } = options?.output?.format
    ? pick(options.output, ['format'])
    : pick(universalOutput, ['format'])

  // @ts-ignore
  formats = Array.isArray(formats) ? formats : [formats]
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
