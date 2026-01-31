import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-screen bg-[var(--background)]">
          <div className="max-w-md p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">Something went wrong</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
