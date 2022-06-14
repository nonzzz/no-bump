import { swc, minify, defineRollupSwcOption } from 'rollup-plugin-swc3'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import type { RollupPlugin, BumpOutputOptions, ModuleFormat, BumpInternalPlugins } from './interface'
import merge from 'lodash.merge'

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
 * @description rollup-plguin-swc
 * https://github.com/SukkaW/rollup-plugin-swc/issues/11
 */

export const getUniversalPlugins = (options: UniversalPluginProps = {}, internalPlugins?: BumpInternalPlugins) => {
  const draft: Record<string, RollupPlugin> = {
    commonjs: commonjs(merge({ esmExternals: true }, internalPlugins?.commonjs)),
    nodeResolve: nodeResolve(internalPlugins?.nodeResolve),
    swc: swc(
      defineRollupSwcOption(
        merge(
          {
            sourceMaps: options.sourceMap,
            jsc: {
              transform: {
                react: options.jsx
              },
              externalHelpers: options.extractHelpers
            }
          },
          internalPlugins?.swc
        )
      )
    ),
    postcss: postcss(
      merge(
        {
          extract: options.extractCss
        },
        internalPlugins?.postcss
      )
    )
  }
  if (options.minifiy)
    Reflect.set(
      draft,
      'minify',
      minify({
        sourceMap: options.sourceMap
      })
    )
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
  minifiy: false,
  preserveModules: false,
  extractHelpers: true,
  exports: 'auto'
}

export const PRESET_FORMAT: ModuleFormat[] = ['cjs', 'esm']
