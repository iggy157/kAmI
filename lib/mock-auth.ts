// Mock authentication for demo purposes
export interface MockUser {
  id: string
  username: string
  email: string
  profileImage?: string
  bio?: string
  isAdmin: boolean
  isSuperAdmin: boolean
  saisenBalance: number
  createdAt: string
}

// In-memory storage for demo (in production, this would be a database)
const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@kami.app",
    isAdmin: true,
    isSuperAdmin: true,
    saisenBalance: 10000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "user1",
    email: "user1@kami.app",
    isAdmin: false,
    isSuperAdmin: false,
    saisenBalance: 1000,
    createdAt: new Date().toISOString(),
  },
]

// Store registered users with their actual passwords
const userPasswords: Record<string, string> = {
  "admin@kami.app": "admin123",
  "user1@kami.app": "user123",
}

// Store created gods
const mockGods: any[] = []

// Store active tokens with user mapping - グローバルに管理
const activeTokens: Record<string, string> = {}

export const mockLogin = async (email: string, password: string): Promise<{ user: MockUser; token: string } | null> => {
  console.log("Mock login attempt:", { email, password, userCount: mockUsers.length })

  // Find user by email
  const user = mockUsers.find((u) => u.email === email)
  if (!user) {
    console.log("User not found for email:", email)
    return null
  }

  // Check password
  const storedPassword = userPasswords[email]
  if (!storedPassword || storedPassword !== password) {
    console.log("Password mismatch:", { provided: password, stored: storedPassword })
    return null
  }

  console.log("Login successful for:", email)
  const token = `mock-token-${user.id}-${Date.now()}`

  // Store token mapping
  activeTokens[token] = user.id
  console.log("Token created and stored:", {
    token: token.substring(0, 30) + "...",
    userId: user.id,
    totalActiveTokens: Object.keys(activeTokens).length,
  })

  return { user, token }
}

export const mockRegister = async (username: string, email: string, password: string): Promise<MockUser | null> => {
  console.log("Mock register attempt:", { username, email, currentUsers: mockUsers.length })

  // Check if user already exists
  const existingUser = mockUsers.find((u) => u.email === email || u.username === username)
  if (existingUser) {
    console.log("User already exists:", existingUser.email)
    return null
  }

  const newUser: MockUser = {
    id: (mockUsers.length + 1).toString(),
    username,
    email,
    isAdmin: false,
    isSuperAdmin: false,
    saisenBalance: 1000,
    createdAt: new Date().toISOString(),
  }

  mockUsers.push(newUser)
  userPasswords[email] = password

  console.log("New user created:", newUser)
  return newUser
}

export const mockGetUserFromToken = async (token: string): Promise<MockUser | null> => {
  console.log("Getting user from token:", {
    token: token.substring(0, 30) + "...",
    activeTokensCount: Object.keys(activeTokens).length,
  })

  // Check if token exists in active tokens
  const userId = activeTokens[token]
  if (!userId) {
    console.log("Token not found in active tokens")
    console.log(
      "Available tokens:",
      Object.keys(activeTokens).map((t) => t.substring(0, 30) + "..."),
    )

    // Fallback: try to parse token (old method)
    const parts = token.split("-")
    if (parts.length >= 3 && parts[0] === "mock" && parts[1] === "token") {
      const fallbackUserId = parts[2]
      console.log("Trying fallback token parsing:", { fallbackUserId })

      const user = mockUsers.find((u) => u.id === fallbackUserId)
      if (user) {
        // Add to active tokens for future use
        activeTokens[token] = user.id
        console.log("User found via fallback, token added to active tokens")
        return user
      }
    }

    console.log("Token validation failed completely")
    return null
  }

  const user = mockUsers.find((u) => u.id === userId)
  console.log("User found from token:", { userId, found: !!user })
  return user || null
}

export const mockUpdateUserBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  const userIndex = mockUsers.findIndex((u) => u.id === userId)
  if (userIndex === -1) {
    console.log("User not found for balance update:", userId)
    return false
  }

  const oldBalance = mockUsers[userIndex].saisenBalance
  mockUsers[userIndex].saisenBalance = newBalance
  console.log("Updated user balance:", { userId, oldBalance, newBalance })
  return true
}

export const mockCreateGod = async (godData: any): Promise<string> => {
  const godId = `god_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const god = {
    id: godId,
    ...godData,
    createdAt: new Date().toISOString(),
  }

  mockGods.push(god)
  console.log("God created:", { godId, totalGods: mockGods.length })
  return godId
}

export const mockGetGodById = async (godId: string): Promise<any | null> => {
  const god = mockGods.find((g) => g.id === godId)
  return god || null
}

export const mockGetUserGods = async (userId: string): Promise<any[]> => {
  return mockGods.filter((g) => g.creatorId === userId)
}

export const getAllMockUsers = (): MockUser[] => {
  return mockUsers
}

export const getAllMockGods = (): any[] => {
  return mockGods
}

// Debug function to check active tokens
export const getActiveTokens = () => {
  return { ...activeTokens } // Return a copy to prevent external modification
}

// 強制的にトークンを追加する関数（デバッグ用）
export const forceAddToken = (token: string, userId: string) => {
  activeTokens[token] = userId
  console.log("Force added token:", { token: token.substring(0, 30) + "...", userId })
}
