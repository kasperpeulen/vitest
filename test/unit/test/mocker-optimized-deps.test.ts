import type { Plugin } from 'vite'
import { parseAst } from 'vite'
import { expect, test } from 'vitest'
import { dynamicImportPlugin } from '../../../packages/mocker/src/node/dynamicImportPlugin'
import { hoistMocksPlugin } from '../../../packages/mocker/src/node/hoistMocksPlugin'

// the plugin context of a dev environment whose optimizer wrote `/deps/`
const context = {
  parse: (code: string) => parseAst(code),
  getCombinedSourcemap: () => null,
  environment: {
    depsOptimizer: { isOptimizedDepFile: (id: string) => id.startsWith('/deps/') },
  },
}

function transform(plugin: Plugin, code: string, id: string) {
  const hook = plugin.transform as any
  const handler = typeof hook === 'function' ? hook : hook.handler
  return handler.call(context, code, id)
}

test('does not wrap dynamic imports of an optimized dependency', () => {
  const plugin = dynamicImportPlugin()
  const code = 'export const load = () => import("./chunk.js")'
  expect(transform(plugin, code, '/deps/lib.js')).toBeUndefined()
  expect(transform(plugin, code, '/src/lib.js')?.code).toMatchInlineSnapshot(
    `"export const load = () => globalThis["__vitest_mocker__"].wrapDynamicImport(async () => import("./chunk.js"))"`,
  )
})

test('does not hoist mocks in an optimized dependency', () => {
  const plugin = hoistMocksPlugin()
  const code = 'import { vi } from "vitest"\nvi.mock("./a.js")'
  expect(transform(plugin, code, '/deps/lib.js')).toBeUndefined()
  // hoisted above the import
  expect(transform(plugin, code, '/src/lib.test.js')?.code).toBe(
    'vi.mock("./a.js")import { vi } from "vitest"\n',
  )
})
