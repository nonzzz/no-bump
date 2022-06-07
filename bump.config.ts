import { define } from './src'

export default define({
  input: ['src/index.ts', 'src/cli.ts'],
  output: {
    dir: 'lib',
    format: ['esm', 'cjs']
  }
})
