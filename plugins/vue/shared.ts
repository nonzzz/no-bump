import crypto from 'crypto'

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
