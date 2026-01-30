'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  sectionName?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary for Beta Dashboard Sections
 *
 * Wraps sections to prevent entire page crashes.
 * Provides graceful fallback UI and error logging.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error(`[ErrorBoundary] Error in ${this.props.sectionName || 'unknown section'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // TODO: Send to error tracking service (Sentry, etc.)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo })
    // }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="bg-havana-navy-light/40 backdrop-blur-md rounded-2xl p-6 border border-red-500/30">
          <div className="text-center">
            <div className="text-4xl mb-4">😕</div>
            <h3 className="text-white font-semibold mb-2">
              Something went wrong
            </h3>
            <p className="text-havana-cyan-light text-sm mb-4">
              {this.props.sectionName
                ? `We had trouble loading the ${this.props.sectionName}.`
                : 'We had trouble loading this section.'}
            </p>
            <Button
              onClick={this.handleRetry}
              className="bg-havana-cyan/20 text-havana-cyan hover:bg-havana-cyan/30"
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Minimal fallback for non-critical sections
 */
export function MinimalErrorFallback({ message }: { message?: string }) {
  return (
    <div className="bg-havana-navy-dark/40 rounded-xl p-4 text-center">
      <p className="text-gray-400 text-sm">
        {message || 'Content temporarily unavailable'}
      </p>
    </div>
  )
}
