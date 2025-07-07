import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    console.log("Registration attempt for:", { username, email })

    if (!username || !email || !password) {
      return NextResponse.json({ error: "すべてのフィールドは必須です" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle()

    console.log("Existing user check:", { existingUser, checkError })

    if (existingUser) {
      return NextResponse.json({ error: "このメールアドレスまたはユーザー名は既に使用されています" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username,
        email,
        password_hash: passwordHash,
        saisen_balance: 1000, // Initial balance
      })
      .select()
      .single()

    console.log("User creation result:", { user: user ? "created" : "failed", error })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          error: "ユーザー作成に失敗しました",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: "ユーザーが正常に作成されました",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "登録に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
