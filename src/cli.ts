import { build } from './index'
import { resolveUserConfig } from './api_impl'

const osArgs = process.argv.slice(2)

export default (async function () {
  const options = {}
  for (const arg of osArgs) {
    switch (arg) {
      case '-c':
        try {
          Object.assign(options, await resolveUserConfig())
          break
        } catch (error) {
          console.log(error)
          process.exit(1)
        }
    }
  }
  await build(options)
})()
