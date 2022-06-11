export const serialize = <T>(source: Record<string, T>): T[] => Object.values(source)

// If the user does not have too many configuration options, the yaml file can be used
export const mayBeConfig = ['bump.config.js', 'bump.config.ts', 'bump.yml', 'bump.yaml']

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

export const pick = <T, K extends keyof T>(source: T, picks: K[]) =>
  picks.reduce((acc, cur) => ((acc[cur] = source[cur]), acc), {} as Pick<T, K>)

export const loadModule = (alias: string) => {
  try {
    return require(alias)
  } catch (err) {
    return false
  } finally {
    delete require.cache[require.resolve(alias)]
  }
}
