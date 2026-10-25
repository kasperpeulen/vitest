import { expect, test } from 'vitest'
import { instances, runInlineBrowserTests } from './utils'

test('transforms the setup files before the tester imports them', async () => {
  const events: string[] = []

  const { stderr, testTree } = await runInlineBrowserTests(
    {
      'setup.ts': `globalThis.__setup = true`,
      'basic.test.ts': `
        import { expect, test } from 'vitest'

        test('runs after the setup file', () => {
          expect(globalThis.__setup).toBe(true)
        })
      `,
    },
    {
      setupFiles: ['./setup.ts'],
      browser: {
        instances: [instances[0]],
      },
      $viteConfig: {
        plugins: [
          {
            name: 'record-setup-file',
            configureServer(server) {
              server.middlewares.use((req, _res, next) => {
                if (req.url?.includes('/setup.ts')) {
                  events.push('request')
                }
                next()
              })
            },
            transform(_code, id) {
              if (id.endsWith('/setup.ts')) {
                events.push('transform')
              }
            },
          },
        ],
      },
    },
  )

  expect(stderr).toBe('')
  expect(testTree()).toMatchInlineSnapshot(`
    {
      "basic.test.ts": {
        "runs after the setup file": "passed",
      },
    }
  `)
  // the pool transforms the setup file while the tester is booting,
  // not when the tester requests it
  expect(events[0]).toBe('transform')
})
