// must be the very first import: it needs to run before any lazy-loaded
// route (in particular the PDF viewer, which pulls in pdfjs-dist) has a
// chance to evaluate and call URL.parse
import '@/shared/polyfills/url-parse'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { tryRecoverFromChunkError } from './app/chunkRecovery'
import './index.css'
import { App } from './App.tsx'

// Vite's own signal for a stale/missing lazy-route chunk after a deploy —
// see chunkRecovery.ts for the loop-protected, route-preserving recovery.
// Only preventDefault (suppress Vite's own error reporting) when we're
// actually about to reload; otherwise let it propagate so the router's
// errorElement can show the friendly fallback screen.
window.addEventListener('vite:preloadError', (event) => {
  if (tryRecoverFromChunkError()) {
    event.preventDefault()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
