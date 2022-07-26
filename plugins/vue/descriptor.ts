/**
 * descriptor information storage in memory.
 */

import type { VueSFCDescriptor } from './interface'

const cache = new Map<string, VueSFCDescriptor>()

export const setDescriptor = (id: string, descriptor: VueSFCDescriptor) => {
  cache.set(id, descriptor)
}

export const getDescriptor = (id: string) => {
  if (cache.has(id)) return cache.get(id)

  throw new Error(`${id} is not parsed yet`)
}
