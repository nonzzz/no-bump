# NoBump Configs

### Background

| Attribue          | Description                                    | Type                                        | Default                               |
| ----------------- | ---------------------------------------------- | ------------------------------------------- | ------------------------------------- |
| `input`           | Input files                                    | [`BumpInputOption`](#bumpinputoption)       | src/index.js                          |
| `output`          | NoBump output options                          | [`BumpOutputOptions`](#bumpoutputoptions)   | -                                     |
| `resolve`         | These options change how modules are resolved  | [`BumpResolveOptions`](#bumpresolveoptions) | -                                     |
| `external`        | Excluding dependencies from the output bundles | `ExternalOption`                            | `dependencies` and `peerdependencies` |
| `global`          | Global variables                               | `Record<string, string>`                    | -                                     |
| `internalOptions` | Set bump internal options                      | `Record<string,any>`                        | -                                     |

#### BumpInputOption

```typescript
export type BumpInputOption = string | string[] | Record<string, string> | Record<string, string[]>
```

#### BumpOutputOptions

```typescript
type ModuleFormat = 'amd' | 'cjs' | 'es' | 'iife' | 'system' | 'umd' | 'commonjs' | 'esm' | 'module' | 'systemjs'

export type GetFileName = (context: { format: ModuleFormat; minify: boolean }, originalFileName: string) => string

export interface BumpOutputOptions {
  // Ouput format(s). Enter the format you want.
  format?: ModuleFormat | ModuleFormat[]
  // Output directory
  dir?: string
  // Output file name
  file?: string | GetFileName
  // Compressed the bundle result.
  minifiy?: boolean
  //  Extract CSS into a single file.
  extractCss?: boolean
  // Generator bundle source map.
  sourceMap?: boolean
  // Generate declaration file(you should write code with typescript)
  dts?: boolean
  jsx?: {
    pragma: string
    pragmaFrag?: string
  }
  // iffe and umd module bundle name.
  name?: string
  preserveModules?: boolean
  preserveModulesRoot?: string
  extractHelpers?: boolean
  exports?: 'default' | 'named' | 'none' | 'auto'
}
```

#### BumpResolveOptions

```typescript
export interface BumpResolveOptions {
  /**
   * @description Define string in files will be replacing while bundling.
   */
  define?: Record<string, string | (() => string)>
  /**
   * @description Define alias.
   */
  alias?:
    | Record<string, string>
    | Array<{
        find: string | RegExp
        replacement: string
      }>
  /**
   * @description file extenions
   */
  extensions?: string[]
}
```
