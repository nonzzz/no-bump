import { swc, minify, defineRollupSwcOption } from 'rollup-plugin-swc3'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import json from '@rollup/plugin-json'
import type { RollupPlugin, RollupInputOption, BumpOutputOptions, ModuleFormat } from './interface'

export interface UniversalPluginProps {
  minifiy?: boolean
  sourceMap?: boolean
  extractCss?: boolean
  jsx?: {
    pragma?: string
    pragmaFrag?: string
  }
}

export const getUniversalPlugins = (options: UniversalPluginProps = {}) => {
  const draft: Record<string, RollupPlugin> = {
    json: json(),
    common: commonjs({ esmExternals: true }),
    resolve: nodeResolve(),
    swc: swc(
      defineRollupSwcOption({
        sourceMaps: options.sourceMap,
        jsc: {
          transform: {
            react: options.jsx
          }
        }
      })
    ),
    postcss: postcss({
      extract: options.extractCss
    })
  }
  if (options.minifiy) Reflect.set(draft, 'minify', minify())
  return draft
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
  minifiy: false
}

export const PRESET_FORMAT: ModuleFormat[] = ['cjs', 'esm']
