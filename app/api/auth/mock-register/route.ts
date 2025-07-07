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

    const user = await mockRegister(username, email, password)

    if (!user) {
      return NextResponse.json({ error: "このメールアドレスまたはユーザー名は既に使用されています" }, { status: 409 })
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
