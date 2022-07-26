import crypto from 'crypto'
import type { RollupError } from 'rollup'
import type { CompilerError, SFCBlock } from '@vue/compiler-sfc'
export interface VueQuery {
  vue?: boolean
  src?: string
  type?: 'script' | 'template' | 'style' | 'custom'
  index?: number
  lang?: string
  raw?: boolean
  scoped?: boolean
}

export const parserVuePartRequest = (id: string) => {
  const [fileName, raw] = id.split('?', 2)
  const query = Object.fromEntries(new URLSearchParams(raw)) as VueQuery
  if (!query.vue) query.vue = false
  if (query.index) query.index = +query.index
  if (!query.raw) query.raw = false
  if (!query.scoped) query.scoped = false
  return {
    fileName,
    query
  }
}

export const hash = (str: string) => crypto.createHash('sha256').update(str).digest('hex').substring(0, 8)

export const handleError = (id: string, error: SyntaxError | CompilerError): RollupError => {
  if ('code' in error) {
    return {
      id,
      plugin: 'bump:vue',
      pluginCode: String(error.code),
      message: error.message,
      frame: error.loc?.source,
      parserError: error,
      loc: error.loc
        ? {
            file: id,
            line: error.loc.start.line,
            column: error.loc.start.column
          }
        : undefined
    }
  }
  return {
    id,
    plugin: 'bump:vue',
    message: error.message,
    parserError: error
  }
}

const ignoreList = ['id', 'index', 'src', 'type', 'lang', 'module', 'scoped']

export const attrsToQuery = (attrs: SFCBlock['attrs'], langFallback?: string, forceLangFallback = false) => {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${encodeURIComponent(name)}${value ? `=${encodeURIComponent(value)}` : ``}`
    }
  }
  if (langFallback || attrs.lang) {
    query +=
      `lang` in attrs ? (forceLangFallback ? `&lang.${langFallback}` : `&lang.${attrs.lang}`) : `&lang.${langFallback}`
  }
  return query
}
