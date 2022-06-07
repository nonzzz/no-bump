import { swc, minify } from 'rollup-plugin-swc3'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import type { RollupPlugin, RollupInputOption, BumpOutputOptions } from './interface'

export const getUniversalPlugins = (mini = true) => {
  const draft: Record<string, RollupPlugin> = {
    common: commonjs({ esmExternals: true }),
    resolve: nodeResolve({
      exportConditions: ['import', 'require', 'default']
    }),
    swc: swc({
      jsc: {
        parser: {
          syntax: 'typescript'
        }
      }
    })
  }
  if (mini) Reflect.set(draft, 'minify', minify)
  return draft
}

/**
 * @default 'src/index.js'
 * @description preset lib entry
 */

export const universalInput: RollupInputOption = 'src/index.js'

/**
 *@default ['cjs','esm','umd']
 @description preset generator formats
 */

export const universalOutput: BumpOutputOptions = {
  dir: 'dist',
  format: ['cjs', 'esm', 'umd']
}
