import type {
  RollupOptions,
  Plugin as RollupPlugin,
  InputOption as RollupInputOption,
  OutputOptions,
  ModuleFormat
} from 'rollup'

export type BumpOptions = RollupOptions

export type BumpOutputOptions = Omit<OutputOptions, 'format'> & {
  format?: ModuleFormat | ModuleFormat[]
}

export { RollupPlugin, RollupInputOption }
