import { parse, compileScript, rewriteDefault } from '@vue/compiler-sfc'
import type { CompilerError, SFCDescriptor } from '@vue/compiler-sfc'
import type { TransformPluginContext, RollupError, SourceMapInput } from 'rollup'
import type { Options } from '.'
import { setDescriptor } from './descriptor'
import { hash } from './shared'

const handleError = (id: string, error: SyntaxError | CompilerError): RollupError => {
  if ('code' in error) {
    return {
      id,
      plugin: 'bump:vue',
      pluginCode: String(error.code),
      message: error.message,
      frame: error.loc?.source,
      parserError: error,
      loc: error.loc
        ? {
            file: id,
            line: error.loc.start.line,
            column: error.loc.start.column
          }
        : undefined
    }
  }
  return {
    id,
    plugin: 'bump:vue',
    message: error.message,
    parserError: error
  }
}

/**
 * @vue/compiler-sfc document:  https://www.npmjs.com/package/@vue/compiler-sfc
 */

export const transformMain = async (
  code: string,
  fileName: string,
  options: Options,
  pluginContext: TransformPluginContext
) => {
  const { descriptor, errors } = parse(code, { filename: fileName, sourceMap: true })
  setDescriptor(fileName, descriptor)
  if (errors.length) {
    errors.forEach((err) => pluginContext.error(handleError(fileName, err)))
    return null
  }

  const scopeId = hash(fileName)
  const hasScoped = descriptor.styles.some((style) => style.scoped)
  //   script
  const { code: parserdCode, sourceMap } = await generaotrScript(descriptor, scopeId, options, pluginContext)
  return { code: parserdCode, map: sourceMap }
}

const generaotrScript = async (
  descriptor: SFCDescriptor,
  scopeId: string,
  options: Options,
  pluginContext: TransformPluginContext
): Promise<{
  code: string
  sourceMap: SourceMapInput
}> => {
  let code = `const _sfc_stdout = {}`
  let map: SourceMapInput = null
  const script = resolveScript(descriptor, scopeId, options)
  if (script) {
    code = rewriteDefault(script.content, '__sfc_stdout', [])
    map = script.map as any
  }
  return {
    code,
    sourceMap: map
  }
}

/**
 * From the source code, sfc provides the ability to convert setup syntax.
 * So we can use it.
 */
const resolveScript = (descriptor: SFCDescriptor, id: string, options: Options) => {
  if (!descriptor.script && !descriptor.scriptSetup) return null
  const resolved = compileScript(descriptor, {
    sourceMap: true,
    isProd: options.isProduction,
    id,
    inlineTemplate: true
  })
  return resolved
}

/***
 *
 * Expect result
 *
 * export render = function() {}
 *
 * export default defineComponent({
 *  xxxx
 * })
 *
 */
