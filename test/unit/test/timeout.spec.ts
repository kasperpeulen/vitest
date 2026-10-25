import { describe, expect, test, TestRunner } from 'vitest'

describe('suite timeout', { timeout: 100 }, () => {
  test('timeout is inherited', async ({ task }) => {
    expect(task.timeout).toBe(100)
  })
})

describe('suite timeout simple input', () => {
  test('timeout is inherited', async ({ task }) => {
    expect(task.timeout).toBe(100)
  })
}, 100)

test('TestRunner.getTimeLeft() is the time left of the test', { timeout: 5000 }, async () => {
  const left = TestRunner.getTimeLeft()!
  expect(left).toBeGreaterThan(4000)
  expect(left).toBeLessThanOrEqual(4900)
  await new Promise((resolve) => setTimeout(resolve, 20))
  expect(TestRunner.getTimeLeft()).toBeLessThan(left)
})

test('TestRunner.getTimeLeft() is undefined without a timeout', { timeout: 0 }, () => {
  expect(TestRunner.getTimeLeft()).toBeUndefined()
})
