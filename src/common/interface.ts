import type {
  RollupOptions,
  Plugin as RollupPlugin,
  InputOption as RollupInputOption,
  OutputOptions,
  ModuleFormat,
  ExternalOption
} from 'rollup'

export type BumpInputOption = RollupInputOption | Record<string, string[]>

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
  file?: string
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
}

export interface BumpOptions {
  /**
   * @default `src/index.js`
   * @description Input files
   */
  input?: BumpInputOption
  output?: BumpOutputOptions
  external?: ExternalOption
  global?: Record<string, string>
  plugins?: Record<string, RollupPlugin>
}

export { RollupPlugin, RollupInputOption, RollupOptions, ModuleFormat, OutputOptions as RollupOutputOptions }
