import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/lib/auth"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  verifyToken: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => {
        console.log("Setting user in store:", user?.username)
        set({ user })
      },
      setToken: (token) => {
        console.log("Setting token in store:", token ? token.substring(0, 30) + "..." : "null")
        set({ token })
      },
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        set({ user: null, token: null })
        // Clear localStorage completely
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
        }
      },
      verifyToken: async () => {
        const { token } = get()
        if (!token) return false

        try {
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          })

          if (!response.ok) {
            console.log("Token verification failed:", response.status)
            return false
          }

          const result = await response.json()
          // Update user data with verified information
          set({ user: result.user })
          return true
        } catch (error) {
          console.error("Token verification error:", error)
          return false
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        console.log("Auth store rehydrated:", {
          hasUser: !!state?.user,
          hasToken: !!state?.token,
          username: state?.user?.username
        })
      },
    },
  ),
)
