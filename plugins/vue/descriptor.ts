import type { SFCDescriptor } from '@vue/compiler-sfc'

const cache = new Map<string, SFCDescriptor>()

export const setDescriptor = (id: string, descriptor: SFCDescriptor) => {
  cache.set(id, descriptor)
}

export const getDescriptor = (id: string) => {
  if (cache.has(id)) return cache.get(id)

  throw new Error(`${id} is not parsed yet`)
}
