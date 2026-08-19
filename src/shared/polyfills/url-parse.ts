// Safari/iOS compatibility for URL.parse used by pdfjs-dist. Feature-detected,
// not UA-sniffed — only installed when the native static method is missing,
// so modern browsers keep using their own implementation untouched.
type URLConstructorWithParse = typeof URL & {
  parse?: (url: string | URL, base?: string | URL) => URL | null
}

const URLApi = URL as URLConstructorWithParse

if (typeof URLApi.parse !== 'function') {
  URLApi.parse = (url: string | URL, base?: string | URL): URL | null => {
    try {
      return new URL(url, base)
    } catch {
      return null
    }
  }
}
