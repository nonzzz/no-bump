import type { BumpOutputOptions, ModuleFormat } from './interface'

export interface UniversalPluginProps {
  minifiy?: boolean
  sourceMap?: boolean
  extractCss?: boolean
  jsx?: {
    pragma?: string
    pragmaFrag?: string
  }
  extractHelpers?: boolean
}

/**
 * @default 'src/index.js'
 * @description preset lib entry
 */

export const universalInput = 'src/index.js'

/**
 *@default ['cjs','esm']
 @description preset generator formats
 */

export const universalOutput: BumpOutputOptions = {
  dir: 'dist',
  sourceMap: true,
  extractCss: true,
  minifiy: false,
  preserveModules: false,
  extractHelpers: true,
  exports: 'auto'
}

export const PRESET_FORMAT: ModuleFormat[] = ['cjs', 'esm']
