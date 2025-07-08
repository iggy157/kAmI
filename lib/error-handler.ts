import { toast } from "sonner"

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export class AppError extends Error {
  public code?: string
  public status?: number
  public details?: any

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = status
    this.details = details
  }
}

export const ErrorCodes = {
  // Authentication errors
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  
  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  
  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  NOT_FOUND: "NOT_FOUND",
  
  // Business logic errors
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // Unknown errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === "string") {
    return error
  }
  
  return "予期しないエラーが発生しました"
}

export function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof AppError && error.code) {
    return error.code as ErrorCode
  }
  
  if (error instanceof Error) {
    // Try to infer error code from message
    const message = error.message.toLowerCase()
    
    if (message.includes("token") || message.includes("認証")) {
      return ErrorCodes.INVALID_TOKEN
    }
    
    if (message.includes("network") || message.includes("ネットワーク")) {
      return ErrorCodes.NETWORK_ERROR
    }
    
    if (message.includes("not found") || message.includes("見つかりません")) {
      return ErrorCodes.NOT_FOUND
    }
    
    if (message.includes("validation") || message.includes("バリデーション")) {
      return ErrorCodes.VALIDATION_ERROR
    }
  }
  
  return ErrorCodes.UNKNOWN_ERROR
}

export function handleError(error: unknown, context?: string): void {
  const message = getErrorMessage(error)
  const code = getErrorCode(error)
  
  console.error(`Error in ${context || "unknown context"}:`, {
    message,
    code,
    error,
  })
  
  // Show user-friendly toast message
  showErrorToast(message, code)
}

export function showErrorToast(message: string, code?: ErrorCode): void {
  const userMessage = getUserFriendlyMessage(message, code)
  toast.error(userMessage)
}

export function showSuccessToast(message: string): void {
  toast.success(message)
}

export function showInfoToast(message: string): void {
  toast.info(message)
}

export function showWarningToast(message: string): void {
  toast.warning(message)
}

function getUserFriendlyMessage(message: string, code?: ErrorCode): string {
  switch (code) {
    case ErrorCodes.INVALID_TOKEN:
    case ErrorCodes.TOKEN_EXPIRED:
    case ErrorCodes.UNAUTHORIZED:
      return "認証に失敗しました。再度ログインしてください。"
      
    case ErrorCodes.NETWORK_ERROR:
      return "ネットワークエラーが発生しました。接続を確認してください。"
      
    case ErrorCodes.TIMEOUT:
      return "処理がタイムアウトしました。もう一度お試しください。"
      
    case ErrorCodes.VALIDATION_ERROR:
    case ErrorCodes.INVALID_INPUT:
      return "入力内容に問題があります。確認してください。"
      
    case ErrorCodes.DATABASE_ERROR:
      return "データベースエラーが発生しました。しばらくしてから再度お試しください。"
      
    case ErrorCodes.NOT_FOUND:
      return "指定されたデータが見つかりません。"
      
    case ErrorCodes.INSUFFICIENT_BALANCE:
      return "賽銭残高が不足しています。"
      
    case ErrorCodes.RATE_LIMIT_EXCEEDED:
      return "リクエストが多すぎます。しばらくしてから再度お試しください。"
      
    default:
      // Return the original message if it's user-friendly (in Japanese)
      if (message && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(message)) {
        return message
      }
      return "予期しないエラーが発生しました。"
  }
}

export function isRetryableError(error: unknown): boolean {
  const code = getErrorCode(error)
  
  return [
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.TIMEOUT,
    ErrorCodes.DATABASE_ERROR,
  ].includes(code)
}

export function shouldRedirectToLogin(error: unknown): boolean {
  const code = getErrorCode(error)
  
  return [
    ErrorCodes.INVALID_TOKEN,
    ErrorCodes.TOKEN_EXPIRED,
    ErrorCodes.UNAUTHORIZED,
  ].includes(code)
}

// Utility function for wrapping async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
  showToast = true
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    if (showToast) {
      handleError(error, context)
    } else {
      console.error(`Error in ${context || "unknown context"}:`, error)
    }
    return null
  }
}

// Utility function for retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
  context?: string
): Promise<T> {
  let lastError: unknown
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries || !isRetryableError(error)) {
        throw error
      }
      
      console.warn(`Retry ${i + 1}/${maxRetries} for ${context || "operation"} failed:`, error)
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  
  throw lastError
}