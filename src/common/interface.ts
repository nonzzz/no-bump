import type {
  RollupOptions,
  Plugin as RollupPlugin,
  InputOption as RollupInputOption,
  OutputOptions,
  ModuleFormat
} from 'rollup'

/**
 *@description Bump config
 */
export type BumpOptions = Omit<RollupOptions, 'output'> & {
  output?: BumpOutputOptions & {
    minifiy?: boolean
  }
}

export type BumpOutputOptions = Omit<OutputOptions, 'format'> & {
  format?: ModuleFormat | ModuleFormat[]
}

export { RollupPlugin, RollupInputOption, RollupOptions }
