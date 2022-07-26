# @bump/plugin-vue

## Background

This is a light rollup plugin for generator `vue3`(SFC).

Compared with `@vitejs/plugin-vue`, `@bump/plugin-vue` realizes most
of functions.

### How it works

Use `@vue/sfc-compiler` transform the SFC file. we will translate `<template>`,`<script>`,`<style>` parts. And then use `fileName` compose them. Write into stdout.

### Difference

Alougth `@vitejs/plugin-vue` is good enough.But it built with too much `vite internal` logic.
Like `hmr`,`ssr`,`cache`。 For libraries it's no necessary. So we only do `load`,`resolve`,`transform`。Will not involve any logical processing associated with `vite`.

### Author

Kanno
