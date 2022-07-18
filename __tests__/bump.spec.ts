import test from 'ava'
import path from 'path'
import fs from 'fs'
import { define, build } from '../src'
import { existSync } from '../src/common/fs'
import type { BumpOptions } from '../src'

const tmpl = path.join(process.cwd(), '.tmpl')

const config: BumpOptions = {
  input: path.join(process.cwd(), 'src/index.ts'),
  output: {
    format: 'esm',
    sourceMap: false,
    dts: false,
    dir: tmpl
  }
}

test('define', (t) => {
  t.is(define(config), config)
})

test('build', async (t) => {
  await build(config)
  t.is(existSync(tmpl), true)
  //   https://nodejs.org/docs/latest/api/fs.html#fsrmsyncpath-options
  const file = path.resolve(tmpl, 'index.esm.js')
  t.is(existSync(file), true)
  fs.rmSync(tmpl, { recursive: true, force: true })
})
