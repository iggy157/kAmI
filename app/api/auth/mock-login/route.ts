import { type NextRequest, NextResponse } from "next/server"
import { mockLogin } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Mock login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードは必須です" }, { status: 400 })
    }

    const result = await mockLogin(email, password)

    if (!result) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが間違っています" }, { status: 401 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Mock login error:", error)
    return NextResponse.json(
      {
        error: "ログインに失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
