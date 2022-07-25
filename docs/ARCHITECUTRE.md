# Architecture Documentation

## Foreword

Usually, We write `javaScript` or `typeScript` libraries. We will choose some tools to pack them.Just like `babel`,`webpack`,`rollup`,`swc` and so on.
Obviously `rollup` is a good way. But we also repeatedly write a lot of configuration.So why not we write a universal zero configuration bundler to resolve?

## Desgin Principles

- DX

Although `no-bump` is a zero configuration bundler,But when you need to customize. the `bump` dx(developer experience) can as well as `rollup`.

- Minimalist and Powerful

For normal usage. zero configuration is enough.But for more scenarios. `no-bump` also can do well.
