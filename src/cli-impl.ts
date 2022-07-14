import path from 'path'
import fs from 'fs'
import { existSync } from './common/fs'

import { configFiles, len } from './common/utils'

import type { BumpOptions } from './common/interface'
import { throwInvalidateError } from './common/logger'
import { transform } from '@swc/core'

// For future we will support inline config from stdin
export const resolveConfig = async (): Promise<BumpOptions> => {
  try {
    let count = len(configFiles)
    let file = ''
    while (count) {
      const name = configFiles[count - 1]
      const p = path.resolve(process.cwd(), name)
      if (existSync(p)) {
        file = p
        break
      }
      count--
    }
    if (!file) return {}
    let code = await fs.promises.readFile(file, 'utf-8')
    ;({ code } = await transform(code, {
      filename: file,
      isModule: 'unknown',
      sourceMaps: false,
      module: {
        type: 'commonjs'
      }
    }))
    return loadConfigFromBundledFile(file, code)
  } catch (err) {
    throw throwInvalidateError(err as any)
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
