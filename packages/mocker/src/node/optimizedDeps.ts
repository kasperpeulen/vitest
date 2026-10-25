import type { Environment } from 'vite'

/**
 * A chunk written by Vite's dependency optimizer. These are re-transformed on
 * every server start and can be megabytes, so parsing them for mocks is the
 * biggest part of the mocker's transform cost. Skipping them loses little:
 * the modules inside a chunk are bundled and cannot be mocked one by one, and
 * a mock of another dependency still applies by its URL. What is lost is
 * that an `import()` inside a dependency no longer waits for a `vi.doMock()`
 * that is still being registered, and that a `vi.mock()` call inside a
 * pre-bundled dependency is not hoisted.
 */
export function isOptimizedDepFile(environment: Environment | undefined, id: string): boolean {
  return (
    !!environment
    && 'depsOptimizer' in environment
    && !!environment.depsOptimizer?.isOptimizedDepFile(id)
  )
}
