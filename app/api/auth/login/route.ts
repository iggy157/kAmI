import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードは必須です" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

    console.log("Database query result:", { user: user ? "found" : "not found", error })

    if (error || !user) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが間違っています" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash)
    console.log("Password validation:", isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが間違っています" }, { status: 401 })
    }

    // Generate token
    const userObj = {
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

    const token = generateToken(userObj)

    return NextResponse.json({
      user: userObj,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "ログインに失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
