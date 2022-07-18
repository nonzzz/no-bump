import { define } from './src'

export default define({
  input: {
    main: ['src/index.ts', 'src/cli.ts']
  },
  output: {
    dir: 'lib',
    sourceMap: false,
    dts: true
  },
  resolve: {
    define: {
      preventAssignment: 'preventAssignment'
    }
  },
  internalOptions: {
    plugins: {
      postcss: false,
      swc: {
        jsc: {
          target: 'es2017'
        }
      }
    }
  }
})
