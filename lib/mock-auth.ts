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

export const mockLogin = async (email: string, password: string): Promise<{ user: MockUser; token: string } | null> => {
  console.log("Mock login attempt:", { email, password, userCount: mockUsers.length })
  console.log(
    "Available users:",
    mockUsers.map((u) => u.email),
  )
  console.log("Available passwords:", Object.keys(userPasswords))

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
  userPasswords[email] = password // Store the actual password

  console.log("New user created:", newUser)
  console.log("Password stored for:", email)
  console.log("Total users now:", mockUsers.length)

  return newUser
}

export const mockGetUserFromToken = async (token: string): Promise<MockUser | null> => {
  const parts = token.split("-")
  if (parts.length < 3) return null

  const userId = parts[2]
  const user = mockUsers.find((u) => u.id === userId)
  console.log("Getting user from token:", { userId, found: !!user })
  return user || null
}

export const mockUpdateUserBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  const userIndex = mockUsers.findIndex((u) => u.id === userId)
  if (userIndex === -1) return false

  mockUsers[userIndex].saisenBalance = newBalance
  console.log("Updated user balance:", { userId, newBalance })
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
