import test from 'ava'
import { Vue } from '..'

let transform: (code: string, id: string) => Promise<{ code: string }>

test.beforeEach(() => {
  transform = Vue().transform as any
})

test('transform', async (t) => {
  //   const { code } =
  await transform(`<script>export default {}</script>`, 'example.vue')
  t.pass()
  //   t.is(code, '<template></template>')
  //   t.is(transform('<template></template>', './src/index.vue'), '<template></template>')
})
