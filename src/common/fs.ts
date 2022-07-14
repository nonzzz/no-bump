import fs from 'fs'

export const exist = (path: string) =>
  fs.promises
    .access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)

export const readJson = (path: string) =>
  fs.promises
    .readFile(path, 'utf-8')
    .then((r) => JSON.parse(r))
    .catch((e) => e)

export const existSync = (path: string) => {
  try {
    fs.accessSync(path, fs.constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}
