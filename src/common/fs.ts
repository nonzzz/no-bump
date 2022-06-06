import fs from 'fs'

export const exist = (path: string) =>
  fs.promises
    .access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
