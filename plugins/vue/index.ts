import type {
  SFCBlock,
  SFCScriptCompileOptions,
  SFCStyleCompileOptions,
  SFCTemplateCompileOptions
} from '@vue/compiler-sfc'

import { createFilter } from '@rollup/pluginutils'

import type { Plugin } from 'rollup'
import { transformMain } from './transform'
import { parserVuePartRequest } from './shared'
import fs from 'fs'

export interface Options {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  customElement?: boolean | string | RegExp | (string | RegExp)[]
  reactivityTransform?: boolean | string | RegExp | (string | RegExp)[]
  isProduction?: boolean
  script?: Partial<Pick<SFCScriptCompileOptions, 'babelParserPlugins'>>
  template?: Partial<
    Pick<
      SFCTemplateCompileOptions,
      | 'compilerOptions'
      | 'compiler'
      | 'compilerOptions'
      | 'preprocessOptions'
      | 'preprocessCustomRequire'
      | 'transformAssetUrls'
    >
  >
  style?: Partial<Pick<SFCStyleCompileOptions, 'trim'>>
}

/**
 * ssr is not supported yet.Because we only do transform code and generator code.
 */

export const Vue = (options: Options = {}): Plugin => {
  const { include = /\.vue$/, exclude = [], customElement = /\.ce\.vue$/ } = options

  const filter = createFilter(include, exclude)

  return {
    name: 'bump:vue',
    async resolveId(id, importer) {
      const { query } = parserVuePartRequest(id)
      if (query.vue) return id
    },
    load(id) {
      const { query, fileName } = parserVuePartRequest(id)
      if (query.vue) {
        if (query.src) return fs.readFileSync(fileName, 'utf8')
        // const descriptor =
      }
      return null
    },
    async transform(code, id) {
      const { query, fileName } = parserVuePartRequest(id)
      //   main
      if (!query.vue && !filter(fileName)) {
        return
      }
      if (!query.vue) {
        return transformMain(code, id, options, this)
      }
    }
  }
}
