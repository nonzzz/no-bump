import { getUniversalPlugins } from './src/common/universal-conf'
import { createBundle } from './src'
;(async () => {
  const { watch } = createBundle({
    plugins: getUniversalPlugins()
  })
  try {
    watch({
      input: ['src/index.ts', 'src/cli.ts'],
      output: {
        dir: 'lib',
        sourceMap: false
      }
    })
  } catch (error) {
    console.log(error)
  }
})()
