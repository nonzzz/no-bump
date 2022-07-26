import type {
  SFCBlock,
  SFCScriptCompileOptions,
  SFCStyleCompileOptions,
  SFCTemplateCompileOptions
} from '@vue/compiler-sfc'

import { createFilter } from '@rollup/pluginutils'

import type { Plugin } from 'rollup'

export interface Options {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  ssr?: boolean
  customElement?: boolean | string | RegExp | (string | RegExp)[]
  reactivityTransform?: boolean | string | RegExp | (string | RegExp)[]
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

export const Vue = (options: Options = {}): Plugin => {
  const { include = /\.vue$/, exclude = [], ssr = false, customElement = /\.ce\.vue$/ } = options

  const filter = createFilter(include, exclude)
  

  return {
    name: 'bump:vue',
    async load(id) {
      console.log(id)
    },
    resolveId() {
      //
    },
    async transform(code, id) {
      //
    }
  }
}
