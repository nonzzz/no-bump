# Bump

Bump is a zero configuration bundler.It base on rollup and you can customize it by your self.

It provides `rollup-plugin-swc3`,`@rollup/plugin-commonjs`,`@rollup/plugin-node-resolve`,`rollup-plugin-postcss` by default.


### Install

```bash

$ npm install no-bump -D

$ yarn add no-bump -D

```


### Usage

```bash

$ bump

```

bump will automatically read the config file in the directory. Support `bump.config.js`,`bump.config.ts`,`bump.yaml`,`bump.yml`

`bump` exports `define` API you only usage in your `.ts` or `.js` file.

```js

import { define } from 'no-bump'


export default define({
  // your config.
})

```

If you find with `cli` not enough. You also can use node API.

```js

import { build , createBundle } from 'build'

```

`build` will use the default config by default. If you want customize the config you can use `createBundle` it will exports `watch` and `build`.


The internal plugins will use preset config. If you want to modify it. you can use `internalPlugins` to set your config.