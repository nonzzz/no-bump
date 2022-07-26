import slash from 'slash'
import { compileScript, parse, rewriteDefault } from '@vue/compiler-sfc'
import path from 'path'
import { setDescriptor, getDescriptor } from './descriptor'
import { handleError, hash, attrsToQuery } from './shared'
import type { TransformPluginContext } from 'rollup'
import type { BumpVuePluginOption, TransformParams, VueSFCDescriptor } from './interface'

const defaultWd = process.cwd()

export const transformMain = ({ input, options, pluginContext }: TransformParams) => {
  const { code, id } = input
  const { errors, descriptor } = parse(code, {
    sourceMap: true,
    filename: id,
    sourceRoot: defaultWd
  })

  const slashed = slash(path.normalize(path.relative(defaultWd, id)))
  const hashId = hash(slashed + code)
  setDescriptor(
    id,
    Object.assign({}, descriptor, {
      id: hashId
    })
  )
  if (errors.length) {
    errors.forEach((err) => pluginContext.error(handleError(id, err)))
    return null
  }
  const { code: scriptCode, map } = transformMainImpl(id, options, pluginContext)
  return {
    code: `${scriptCode};\n export default _sfc_main`,
    map
  }
}

const transformMainImpl = (id: string, options: BumpVuePluginOption, pluginContext: TransformPluginContext) => {
  const descriptor = getDescriptor(id)!
  let scriptCode = `const _sfc_main = {}`
  let map: any
  const script = resolveVueScript(descriptor, options)
  if (script) {
    //
    if (!script.lang && !script.src) {
      const userPlugins = options.script?.babelParserPlugins || []
      const defaultPlugins =
        script.lang === 'ts'
          ? userPlugins.includes('decorators')
            ? (['typescript'] as const)
            : (['typescript', 'decorators-legacy'] as const)
          : []
      scriptCode = rewriteDefault(script.content, '_sfc_main', [...defaultPlugins, ...userPlugins])
      map = script.map
    } else {
      //
      const src = script.src || descriptor.filename
      const langFallback = (script.src && path.extname(src).slice(1)) || 'js'
      const attrsQuery = attrsToQuery(script.attrs, langFallback)
      const srcQuery = script.src ? `&src=true` : ``
      const query = `?vue&type=script${srcQuery}${attrsQuery}`
      const request = JSON.stringify(src + query)
      scriptCode = `import _sfc_main from ${request}\n` + `export * from ${request}` // support named exports
    }
  }
  return {
    code: scriptCode,
    map
  }
}

const resolveVueScript = (descriptor: VueSFCDescriptor, options: BumpVuePluginOption) => {
  const { script, scriptSetup } = descriptor
  if (!script && !scriptSetup) return null
  return compileScript(descriptor, {
    ...options.script,
    id: descriptor.id,
    isProd: options.isProduction,
    inlineTemplate: true,
    reactivityTransform: options.reactivityTransform !== false,
    // templateOptions:resolveTempalteOptions(descriptor,options),
    sourceMap: true
  })
  //   const { script } = descriptor
  //   if (script) {
  //     return script.content
  //   }
  //   return null
}

// const resolveTempalteOptions = (descriptor: VueSFCDescriptor, options: BumpVuePluginOption) => {
//   const block = descriptor.template
//   if (!block) return
//   const hasScoped = descriptor.styles.some((s) => s.scoped)
//   const { id, filename, cssVars } = descriptor
//   let transformAssetUrls = options.template?.transformAssetUrls
//   let assetUrlOptions
//   return {}
// }
