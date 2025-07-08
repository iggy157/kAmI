"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // In a real application, you might want to send error details to an error reporting service
    if (typeof window !== "undefined") {
      // Log to external service (e.g., Sentry, LogRocket, etc.)
      console.error("React Error Boundary caught an error:", {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-800">
            申し訳ございません
          </CardTitle>
          <CardDescription className="text-red-600">
            予期しないエラーが発生しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              アプリケーションでエラーが発生しました。<br />
              ページを再読み込みするか、ホームページに戻ってください。
            </p>

            <div className="flex justify-center gap-4">
              <Button onClick={resetError} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                再試行
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  ホームに戻る
                </Button>
              </Link>
            </div>
          </div>

          {isDevelopment && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm text-gray-800">開発者情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong className="text-sm text-gray-700">エラー:</strong>
                    <p className="text-sm text-red-600 font-mono mt-1">
                      {error.message}
                    </p>
                  </div>
                  {error.stack && (
                    <div>
                      <strong className="text-sm text-gray-700">スタックトレース:</strong>
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded border mt-1 overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              問題が続く場合は、
              <Link href="/contact" className="text-purple-600 hover:text-purple-800 ml-1">
                お問い合わせ
              </Link>
              からご連絡ください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Higher-order component for easy usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary