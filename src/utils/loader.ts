const states = {} as Record<string, Promise<void>>

const loaders = [
  {
    test: /\.js$/,
    load: (url: string) =>
      new Promise<void>((resolve) => {
        const el = document.createElement('script')
        el.src = url
        el.async = true
        el.onload = () => resolve()
        document.head.appendChild(el)
      })
  },
  {
    test: /\.css$/,
    load: (url: string) =>
      new Promise<void>((resolve) => {
        const el = document.createElement('link')
        el.href = url
        el.rel = 'stylesheet'
        el.onload = () => resolve()
        document.head.appendChild(el)
      })
  }
]

function loadResource(url: string) {
  if (typeof url !== 'string') {
    return url
  }
  const promise = states[url]
  if (promise) {
    return promise
  }
  for (const loader of loaders) {
    if (loader.test.test(url)) {
      states[url] = loader.load(url)
      return states[url]
    }
  }
  return Promise.reject(`Cannot load unsupported resource "${url}"`)
}

export function load(urls: string[]) {
  return Promise.all(urls.map(loadResource))
}
