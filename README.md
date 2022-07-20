# NoBump

### OverView

NoBump is an zero configuration bundler. It based on rollup and you can customize it by a easy way. Let you work with rollup with
a light way.

### Install

```bash

$ npm install no-bump -D

$ yarn add no-bump -D

```

### Usage

```bash

$ bump

```

bump will automatically read the config file in the your work sapce (default it's the process.cwd ). Support `bump.config.js`,`bump.config.ts`

`bump` exports `define` API you only usage in your `.ts` or `.js` file.

```js
import { define } from 'no-bump'

export default define({
  // your config.
})
```

If you find with `cli` not enough. You also can use node API.

```js
import { build, watch } from 'build'
```

Node API doesn't read your config file it's more suitable for you to build into your build task.

The full config please see [CONFIGS](./docs/CONFIG.md)
