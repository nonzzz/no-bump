import fs from 'fs'
import path from 'path'
import { build } from '../src'
import { dependencies as ParentDependencies } from './package.json'

const defaultWd = __dirname

const ignored = ['node_modules']

const includes = (path: string, ignored: string[]) => ignored.every((i) => path.includes(i))

;(async () => {
  const subPackages = fs
    .readdirSync(path.join(defaultWd))
    .map((dir) => {
      const real = path.join(defaultWd, dir)
      if (includes(real, ignored)) return false
      return fs.statSync(real).isDirectory() ? real : false
    })
    .filter(Boolean) as string[]
  await Promise.all(
    subPackages.map(async (dir) => {
      const subPackageJson = path.join(dir, 'package.json')
      if (!fs.existsSync(subPackageJson)) return
      const r = await fs.promises.readFile(subPackageJson, 'utf8')
      const { dependencies = {}, peerDependencies = {} } = JSON.parse(r) as {
        dependencies: Record<string, string>
        peerDependencies: Record<string, string>
      }
      build({
        input: path.join(dir, 'index.ts'),
        output: {
          dir: path.join(dir, 'dist'),
          dts: true,
          sourceMap: false
        },
        external: [...Object.keys(dependencies), ...Object.keys(peerDependencies), ...Object.keys(ParentDependencies)]
      })
    })
  )
})()
