/**
 * Returns the resolved value of a promise if it has been resolved.
 *
 * @remarks
 * If the promise is rejected, the function will throw an error.
 * If the promise is pending, the function will throw a promise
 * that will be settled when the promise is settled.
 *
 * @public
 */
export function awaited<T>(promise: PromiseLike<T>): Awaited<T> {
  let entry = awaitedCache.get(promise)
  if (!entry) {
    entry = new AwaitedCacheEntry<T>(promise)
    awaitedCache.set(promise, entry)
  }
  return entry.getAwaitedValue()
}

/**
 * Internal cache used by `awaited`.
 *
 * @internal
 */
export const awaitedCache = new WeakMap<
  PromiseLike<any>,
  AwaitedCacheEntry<any>
>()

/**
 * @internal
 */
export class AwaitedCacheEntry<T> {
  getAwaitedValue: () => T
  constructor(promise: PromiseLike<T>) {
    let resolvedPromise: Promise<T>
    this.getAwaitedValue = () => {
      throw resolvedPromise
    }
    resolvedPromise = Promise.resolve(promise).then(
      (value) => {
        this.getAwaitedValue = () => value
        return value
      },
      (error) => {
        this.getAwaitedValue = () => {
          throw error
        }
        throw error
      },
    )
  }
}
