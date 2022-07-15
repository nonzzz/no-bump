import { build } from './api-impl'
import { print } from './common/logger'
import { resolveConfig } from './cli-impl'

export default (async function () {
  try {
    const options = await resolveConfig()
    await build(options)
  } catch (error) {
    if (error instanceof Error) print.danger(error.message)
    process.exit(1)
  }
})()
