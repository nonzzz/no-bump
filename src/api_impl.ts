import { rollup } from 'rollup'
import fs from 'fs'
import { mayBeConfig } from './common/utils'
import { exist } from './common/fs'
import type { BumpOptions } from './common/interface'
import path from 'path'

/**
 * dine config typings.
 */
export const define = (options?: BumpOptions) => {
  //
}

export const build = (options?: BumpOptions) => buildImpl(options)

const buildImpl = async (options?: BumpOptions) => {
  try {
    if (options) {
      for (const p of mayBeConfig) {
        const full = path.join(process.cwd(), p)
        if (await exist(full)) {
          break
        }
      }
    }
  } catch (error) {
    console.log('Please entry uer config')
    process.exit(1)
  }
}
