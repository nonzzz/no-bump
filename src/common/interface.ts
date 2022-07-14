import type { RollupCommonJSOptions } from '@rollup/plugin-commonjs'
import { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve'
import type {
  RollupOptions,
  Plugin as RollupPlugin,
  InputOption as RollupInputOption,
  OutputOptions,
  ModuleFormat,
  ExternalOption
} from 'rollup'
import type { PostCSSPluginConf as RollupPostCssOptions } from 'rollup-plugin-postcss'
import type { PluginOptions as RollupSwcOptions } from 'rollup-plugin-swc3'

export type BumpInputOption = RollupInputOption | Record<string, string[]>

export type GetFileName = (context: { format: ModuleFormat; minify: boolean }, originalFileName: string) => string

export interface BumpOutputOptions {
  /**
   * @default `['esm','cjs']`
   * @description Ouput format(s). Enter the format you want.
   * Tips: when format is umd mode. You should set name for it.
   **/
  format?: ModuleFormat | ModuleFormat[]
  /**
   * @default `dist`
   * @description Output directory
   */
  dir?: string
  /**
   *@description Output file name
   *
   * Default output format:
   * -  `[name][min][ext]` both with `cjs` and `esm` format.
   * -  `[name][min].[format][ext]` with others
   *
   */
  file?: string | GetFileName
  /**
   * @default `false`
   * @description Compressed the bundle result.
   */
  minifiy?: boolean
  /**
   * @default `true`
   * @description Extract CSS into a single file.
   */
  extractCss?: boolean
  /**
   * @default `true`
   * @description Generator bundle source map.
   */
  sourceMap?: boolean
  /**
   * @default `false`
   * @description Generate declaration file(you should write code with typescript)
   */
  dts?: boolean
  /**
   *
   *@description Translate your jsx file
   */
  jsx?: {
    pragma: string
    pragmaFrag?: string
  }
  /**
   * @description iffe and umd module bundle name.
   */
  name?: string
  /**
   * @description see: https://rollupjs.org/guide/en/#outputpreservemodules
   */
  preserveModules?: boolean
  preserveModulesRoot?: string
  /**
   * @description Use `@swc/helpers` instead of inline helpers.
   * Default `true`
   */
  extractHelpers?: boolean
  exports?: 'default' | 'named' | 'none' | 'auto'
}

export interface BumpResolveOptions {
  define?: Record<string, string | (() => string)>
  alias?:
    | Record<string, string>
    | Array<{
        find: string | RegExp
        replacement: string
      }>
  extensions?: string[]
}

export interface BumpInternalPlugins {
  commonjs?: RollupCommonJSOptions
  nodeResolve?: RollupNodeResolveOptions
  swc?: RollupSwcOptions
  postcss?: RollupPostCssOptions
}

export interface BumpOptions {
  /**
   * @default `src/index.js`
   * @description Input files
   */
  input?: BumpInputOption
  output?: BumpOutputOptions
  resolve?: BumpResolveOptions
  external?: ExternalOption
  global?: Record<string, string>
  plugins?: Record<string, RollupPlugin>
  internalPlugins?: BumpInternalPlugins
}

export { RollupPlugin, RollupInputOption, RollupOptions, ModuleFormat, OutputOptions as RollupOutputOptions }
