# Architecture Documentation

## Foreword

Usually, We write `javaScript` or `typeScript` libraries. We will choose some tools to pack them.Just like `babel`,`webpack`,`rollup`,`swc` and so on. 
We need to do a lot of configuration. So why we write a universal zero configuration bundler to resolve? Obviously `rollup` is a good way. 

## Desgin Principles

- Free as possible

Although `no-bump` is a zero configuration bundler,But it has enough expansion.

- Minimalist and Powerful

For normal usage. zero configuration is enough.But for more scenarios. `no-bump` also can do well.

