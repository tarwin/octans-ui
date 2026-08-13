const deferredPromise = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    resolve,
    reject,
    promise
  }
}

export default deferredPromise
