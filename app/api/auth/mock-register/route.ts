import { type NextRequest, NextResponse } from "next/server"
import { mockRegister } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    console.log("Mock registration attempt for:", { username, email })

    if (!username || !email || !password) {
      return NextResponse.json({ error: "すべてのフィールドは必須です" }, { status: 400 })
    }

    // Basic validation
    if (username.length < 3) {
      return NextResponse.json({ error: "ユーザー名は3文字以上で入力してください" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上で入力してください" }, { status: 400 })
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 })
    }

    const user = await mockRegister(username, email, password)

    if (!user) {
      return NextResponse.json({ error: "このメールアドレスまたはユーザー名は既に使用されています" }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      message: "ユーザーが正常に作成されました",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Mock registration error:", error)
    return NextResponse.json(
      {
        error: "登録に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
