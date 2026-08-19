import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
}

// Catches synchronous render-time crashes from react-pdf/pdfjs (as opposed
// to async load failures, which Document's own onLoadError/error props
// handle) so they never bubble up to the router's default error boundary.
export class PdfErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[PdfViewer] render error:', error)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
