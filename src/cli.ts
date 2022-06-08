import { resolveUserConfig, build } from './api-impl'
import { print } from './common/logger'

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
          if (error instanceof Error) print.danger(error.message)
          process.exit(1)
        }
    }
  }
  await build(options)
})()
