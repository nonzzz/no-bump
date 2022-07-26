import { createFilter } from '@rollup/pluginutils'

import fs from 'fs'

import { parserVuePartRequest } from './shared'

import type { Plugin } from 'rollup'
import type { BumpVuePluginOption } from './interface'
import { transformMain } from './transform'

export { BumpVuePluginOption } from './interface'

export const Vue = (options: BumpVuePluginOption = {}): Plugin => {
  const { include = /\.vue$/, exclude = [], customElement = /\.ce\.vue$/ } = options

  const filter = createFilter(include, exclude)

  return {
    name: 'bump:vue',
    async resolveId(id, importer) {
      const { query } = parserVuePartRequest(id)
      if (query.vue) return id
    },
    load(id) {
      const { query, fileName } = parserVuePartRequest(id)
      if (query.vue) {
        if (query.src) return fs.readFileSync(fileName, 'utf8')
        // const descriptor =
      }
      return null
    },
    async transform(code, id) {
      const { query, fileName } = parserVuePartRequest(id)
      const paramter = {
        input: {
          code,
          id: fileName
        },
        options,
        pluginContext: this
      }
      //   main
      if (!query.vue && !filter(fileName)) {
        return
      }
      if (!query.vue) {
        return transformMain(paramter)
        // return transformMain(code, id, options, this)
      }
    }
  }
}
