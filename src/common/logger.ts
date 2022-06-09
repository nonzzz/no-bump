export const print = {
  log: (text: string) => console.log('\x1b[37m%s \x1b[2m%s\x1b[0m', '>', text),
  danger: (text: string) => console.log('\x1b[31m%s \x1b[31m%s\x1b[0m', '>', text),
  tip: (text: string) => console.log('\x1b[36m%s \x1b[36m%s\x1b[0m', '>', text)
}

export const error = (base: Error | Record<string, any>) => {
  if (!(base instanceof Error)) base = Object.assign(new Error(base.message), base)
  return base
}

export const throwInvalidateError = (err: string | Record<string, any>) => {
  if (typeof err === 'string') err = { message: err }
  return error(err)
}
