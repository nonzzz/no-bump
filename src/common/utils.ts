export const serialize = (source: Record<string, unknown>): unknown[] => Object.values(source)

/**
 * If the user does not have too many configuration options, the yaml file can be used
 */

export const mayBeConfig = ['bump.config.js', 'bump.config.ts', 'bump.yml', 'bump.yaml']
