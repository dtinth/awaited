import { awaited } from '.'

it('returns value when promise is resolved', async () => {
  const promise = Promise.resolve(42)
  await unsuspend(() => awaited(promise))
  const value = awaited(promise)
  expect(value).toBe(42)
})

it('throws the error when promise is rejected', async () => {
  const error = new Error('yabai')
  const promise = Promise.reject(error)
  await unsuspend(() => awaited(promise))
  expect(() => awaited(promise)).toThrow(error)
})

async function unsuspend(reader: () => void) {
  for (;;) {
    try {
      reader()
      return
    } catch (error) {
      if ('then' in error) {
        await Promise.resolve(error).catch(() => {})
        continue
      }
      return
    }
  }
}
