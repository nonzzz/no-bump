import { define } from './src'
import fg from 'fast-glob'

export default define({
  input: fg.sync(['./src/**'], { dot: true }),
  output: {
    dir: 'lib',
    format: 'cjs'
  }
})
