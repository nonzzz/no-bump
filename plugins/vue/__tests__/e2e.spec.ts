import { build } from '../../../src'
import { Vue } from '..'
import path from 'path'
;(async () => {
  await build({
    input: path.join(__dirname, './entry.ts'),
    output: {
      dir: path.join(__dirname, 'dist'),
      dts: false,
      sourceMap: false,
      format: 'es'
    },
    plugins: {
      Vue
    }
  })
})()
