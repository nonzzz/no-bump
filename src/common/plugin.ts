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

import { hasOwn, isPlainObject, len, serialize } from './utils'
import { print } from './logger'

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
  const internalPlugins = withIntenralPlugins(internalPluginsOptions ?? {}, userOptions)
  const { plugins: parserdUserPlugins, errMessage } = withUserPlugins(userPlugins ?? {})
  if (len(errMessage)) errMessage.forEach((log) => print.tip(log))

  const plugins = serializePlugin(internalPlugins, parserdUserPlugins)

  debugger

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
  internalPluginOtions: BumpInternalPlugins,
  options?: ParaserPluginOptions['options']
) => {
  const fill = (internalPlugins: Record<string, (config: unknown) => RollupPlugin>) => {
    const plugins: any = { ...internalPlugins }

    for (const plugin in plugins) {
      if (hasOwn(internalPluginOtions, plugin)) {
        const value = internalPluginOtions[plugin as keyof BumpInternalPlugins]
        if (value) {
          plugins[plugin] = internalPlugins[plugin](typeof value === 'boolean' ? {} : value)
        } else {
          delete plugins[plugin]
        }
        continue
      }
      plugins[plugin] = internalPlugins[plugin]({})
    }

    return plugins
  }

  const internalPlugins: Record<string, (config: unknown) => RollupPlugin> = {
    define: () =>
      define(
        merge(
          {
            preventAssignment: true
          },
          options?.resolve?.define
        )
      ),
    commonjs: (config) => commonjs(merge({ esmExternals: true }, config)),
    nodeResolve: (config: any) => nodeResolve(config),
    swc: (config) =>
      swc(
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
            config
          )
        )
      ),
    postcss: (config) =>
      postcss(
        merge(
          {
            extract: options?.extractCss
          },
          config
        )
      )
  }
  return fill(internalPlugins)
}

const withUserPlugins = (userPlugins: Record<string, RollupPlugin>) => {
  const plugins: Record<string, RollupPlugin> = {}
  const errMessage = []
  for (const name in userPlugins) {
    let plugin = userPlugins[name]
    if (typeof plugin === 'function') {
      plugin = (plugin as Function).apply(plugin)
      if (!isPlainObject(plugin) || !plugin.name) {
        errMessage.push(`[Bump]: Plugin ${name} not a standard rollup or vite plugin.`)
        continue
      }
    }
    plugins[name] = plugin
  }
  return {
    plugins,
    errMessage
  }
}

const serializePlugin = (plugins: Record<string, RollupPlugin>, userPlugins?: Record<string, RollupPlugin>) => {
  if (!userPlugins || !len(Object.keys(userPlugins))) return serialize(plugins)
  const merged = Object.assign({}, userPlugins, plugins)
  return serialize(merged)
}
