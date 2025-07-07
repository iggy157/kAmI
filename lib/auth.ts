import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { supabase } from "./supabase"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
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

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const getUserFromToken = async (token: string): Promise<User | null> => {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const { data: user } = await supabase.from("users").select("*").eq("id", decoded.id).single()

  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    profileImage: user.profile_image,
    bio: user.bio,
    isAdmin: user.is_admin,
    isSuperAdmin: user.is_super_admin,
    saisenBalance: user.saisen_balance,
    createdAt: user.created_at,
  }
}
