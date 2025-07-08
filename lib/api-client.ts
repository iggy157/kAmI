import { AppError, ErrorCodes, withRetry } from './error-handler'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  retries?: number
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private getAuthHeader(): Record<string, string> {
    if (typeof window !== 'undefined') {
      const token = this.getStoredToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    }
    return {}
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          return parsed.state?.token || null
        }
      } catch (error) {
        console.error('Failed to get stored token:', error)
      }
    }
    return null
  }

  private clearAuthStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage')
    }
  }

  private async handleResponse(response: Response): Promise<any> {
    // Handle authentication errors - but don't auto-logout for now
    if (response.status === 401) {
      console.warn('Authentication failed, but not clearing token automatically')
      
      throw new AppError(
        '認証に失敗しました。',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'リクエストの処理中にエラーが発生しました'
      let errorCode = ErrorCodes.UNKNOWN_ERROR
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorMessage
        errorCode = this.mapHttpStatusToErrorCode(response.status)
      } catch {
        // If we can't parse the error, use the status text
        errorMessage = response.statusText || errorMessage
        errorCode = this.mapHttpStatusToErrorCode(response.status)
      }

      throw new AppError(errorMessage, errorCode, response.status)
    }

    // Handle successful responses
    const responseText = await response.text()
    
    if (!responseText) {
      return { success: true }
    }

    try {
      return JSON.parse(responseText)
    } catch (error) {
      console.error('Failed to parse response JSON:', error)
      throw new AppError(
        'サーバーからの応答が無効です',
        ErrorCodes.UNKNOWN_ERROR,
        response.status
      )
    }
  }

  private mapHttpStatusToErrorCode(status: number): string {
    switch (status) {
      case 400:
        return ErrorCodes.VALIDATION_ERROR
      case 401:
        return ErrorCodes.UNAUTHORIZED
      case 403:
        return ErrorCodes.UNAUTHORIZED
      case 404:
        return ErrorCodes.NOT_FOUND
      case 408:
        return ErrorCodes.TIMEOUT
      case 429:
        return ErrorCodes.RATE_LIMIT_EXCEEDED
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorCodes.DATABASE_ERROR
      default:
        return ErrorCodes.UNKNOWN_ERROR
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const { method = 'GET', headers = {}, body, retries = 0 } = options

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...headers,
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    }

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    const makeRequest = async (): Promise<T> => {
      try {
        const response = await fetch(url, requestOptions)
        return await this.handleResponse(response)
      } catch (error) {
        // Network or other errors
        if (error instanceof AppError) {
          throw error
        }
        
        if (error instanceof Error) {
          // Check if it's a network error
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new AppError(
              'ネットワークエラーが発生しました',
              ErrorCodes.NETWORK_ERROR
            )
          }
          throw new AppError(error.message, ErrorCodes.UNKNOWN_ERROR)
        }
        
        throw new AppError('ネットワークエラーが発生しました', ErrorCodes.NETWORK_ERROR)
      }
    }

    // Use retry logic for GET requests and certain error conditions
    if (retries > 0 && (method === 'GET' || method === undefined)) {
      return withRetry(() => makeRequest(), retries, 1000, `API ${method} ${endpoint}`)
    }

    return makeRequest()
  }

  // Convenience methods
  async get<T = any>(endpoint: string, headers?: Record<string, string>, retries = 2): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers, retries })
  }

  async post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers })
  }

  async put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers })
  }

  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }
}

// Create a singleton instance
export const apiClient = new ApiClient()

// Export the class for testing purposes
export { ApiClient }