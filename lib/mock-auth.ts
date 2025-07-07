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

export const mockLogin = async (email: string, password: string): Promise<{ user: MockUser; token: string } | null> => {
  // Simple mock authentication
  if (email === "admin@kami.app" && password === "admin123") {
    const user = mockUsers[0]
    const token = `mock-token-${user.id}-${Date.now()}`
    return { user, token }
  }

  if (email === "user1@kami.app" && password === "user123") {
    const user = mockUsers[1]
    const token = `mock-token-${user.id}-${Date.now()}`
    return { user, token }
  }

  return null
}

export const mockRegister = async (username: string, email: string, password: string): Promise<MockUser | null> => {
  // Check if user already exists
  const existingUser = mockUsers.find((u) => u.email === email || u.username === username)
  if (existingUser) {
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
  return newUser
}

export const mockGetUserFromToken = async (token: string): Promise<MockUser | null> => {
  const userId = token.split("-")[2]
  return mockUsers.find((u) => u.id === userId) || null
}
