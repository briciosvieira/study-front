// must be the very first import: it needs to run before any lazy-loaded
// route (in particular the PDF viewer, which pulls in pdfjs-dist) has a
// chance to evaluate and call URL.parse
import '@/shared/polyfills/url-parse'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
