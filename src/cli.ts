import { resolveUserConfig, build } from './api-impl'
import { print } from './common/logger'

export default (async function () {
  const options = {}
  try {
    Object.assign(options, await resolveUserConfig())
  } catch (error) {
    if (error instanceof Error) print.danger(error.message)
    process.exit(1)
  }
  await build(options)
})()
