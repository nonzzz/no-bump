export const serialize = <T>(source: Record<string, T>): T[] => Object.values(source)

export const configFiles = ['bump.config.js', 'bump.config.ts']

const BASIC_TYPES = {
  Null: 'Null',
  Undefined: 'Undefined',
  String: 'String',
  Number: 'Number',
  Boolean: 'Boolean',
  Array: 'Array',
  Date: 'Date',
  Function: 'Function',
  RegExp: 'RegExp',
  Object: 'Object'
}

const getUniversalType = (tar: unknown): string => Object.prototype.toString.call(tar).slice(8, -1)

export const isPlainObject = <T>(tar: unknown): tar is T => getUniversalType(tar) === BASIC_TYPES.Object

export const omit = <T, K extends keyof T>(source: T, picks: K[]) =>
  (Object.keys(source) as K[]).reduce(
    (acc, cur) => (picks.includes(cur) ? acc : Object.assign(acc, { [cur]: source[cur] })),
    {} as Omit<T, K>
  )

export const loadModule = (alias: string) => {
  try {
    const raw = require(alias)
    return raw.__esModule ? raw.default : raw
  } catch (err) {
    return false
  } finally {
    delete require.cache[require.resolve(alias)]
  }
}

export const len = (tar: string | unknown[]) => tar.length

export const hasOwn = (source: Record<string, any>, key: string) => Object.prototype.hasOwnProperty.call(source, key)
