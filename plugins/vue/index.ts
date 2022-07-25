import type {
  SFCBlock,
  SFCScriptCompileOptions,
  SFCStyleCompileOptions,
  SFCTemplateCompileOptions
} from '@vue/compiler-sfc'

import type { Plugin } from 'rollup'

export interface Options {
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

export const Vue = (options = {}): Plugin => {
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
