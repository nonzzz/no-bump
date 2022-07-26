import type {
  SFCScriptCompileOptions,
  SFCStyleCompileOptions,
  SFCTemplateCompileOptions,
  SFCDescriptor
} from '@vue/compiler-sfc'
import type { TransformPluginContext } from 'rollup'

export interface BumpVuePluginOption {
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

export interface TransformParams {
  input: {
    code: string
    id: string
  }
  options: BumpVuePluginOption
  pluginContext: TransformPluginContext
}

export interface VueSFCDescriptor extends SFCDescriptor {
  id: string
}
