/**
 * Parse and serialize plugins for bump
 */

import alias from '@rollup/plugin-alias'
import define from '@rollup/plugin-replace'
import { swc, minify, defineRollupSwcOption } from 'rollup-plugin-swc3'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import merge from 'lodash.merge'

import { len, serialize } from './utils'

import type { RollupPlugin, BumpOutputOptions, BumpInternalPlugins, BumpResolveOptions } from './interface'

export type InternalPluginParams = Pick<
  BumpOutputOptions,
  'minifiy' | 'sourceMap' | 'extractCss' | 'jsx' | 'extractHelpers'
>

interface ParaserPluginOptions {
  userPlugins?: Record<string, RollupPlugin>
  internalPluginsOptions?: BumpInternalPlugins
  options?: Pick<BumpOutputOptions, 'minifiy' | 'jsx' | 'extractCss' | 'extractHelpers' | 'sourceMap'> & {
    resolve?: BumpResolveOptions
  }
}

export const parserPlugins = (options: ParaserPluginOptions = {}): RollupPlugin[] => {
  const { userPlugins, internalPluginsOptions, options: userOptions } = options
  const internalPlugins = withIntenralPlugins(internalPluginsOptions, userOptions)
  const plugins = serializePlugin(internalPlugins, userPlugins)

  const getAliasPattern = (pattern?: BumpResolveOptions['alias']) => {
    if (!pattern) return []
    if (Array.isArray(pattern)) return pattern
    return Object.entries(pattern).map(([find, replacement]) => ({
      ['find']: find,
      ['replacement']: replacement
    }))
  }
  /**
   * Alias first
   * then user plugins
   * then internal plugins
   * then minifiy
   */

  if (userOptions?.minifiy) {
    plugins.push(minify({ sourceMap: userOptions?.sourceMap }))
  }

  plugins.unshift(
    alias({
      entries: getAliasPattern(userOptions?.resolve?.alias)
    })
  )
  return plugins
}

export const withIntenralPlugins = (
  internalPluginOtions?: BumpInternalPlugins,
  options?: ParaserPluginOptions['options']
) => {
  const internalPlugins: Record<string, RollupPlugin> = {
    commonjs: commonjs(merge({ esmExternals: true }, internalPluginOtions?.commonjs)),
    define: define(options?.resolve?.define),
    nodeResolve: nodeResolve(internalPluginOtions?.nodeResolve),
    swc: swc(
      defineRollupSwcOption(
        merge(
          {
            sourceMaps: options?.sourceMap,
            jsc: {
              transform: {
                react: options?.jsx
              },
              externalHelpers: options?.extractHelpers
            }
          },
          internalPluginOtions?.swc
        )
      )
    ),
    postcss: postcss(
      merge(
        {
          extract: options?.extractCss
        },
        internalPluginOtions?.postcss
      )
    )
  }
  return internalPlugins
}

const serializePlugin = (plugins: Record<string, RollupPlugin>, userPlugins?: Record<string, RollupPlugin>) => {
  if (!userPlugins || !len(Object.keys(userPlugins))) return serialize(plugins)
  const merged = Object.assign({}, userPlugins, plugins)
  return serialize(merged)
}
