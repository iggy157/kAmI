import { type NextRequest, NextResponse } from "next/server"
import { mockLogin, forceAddToken } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Mock Login API Called ===")

    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードは必須です" }, { status: 400 })
    }

    const result = await mockLogin(email, password)

    if (!result) {
      console.log("Login failed")
      return NextResponse.json({ error: "メールアドレスまたはパスワードが間違っています" }, { status: 401 })
    }

    const { user, token } = result

    // 念のため、トークンを強制的に追加（デバッグ用）
    forceAddToken(token, user.id)

    console.log("Login successful:", {
      userId: user.id,
      username: user.username,
      token: token.substring(0, 30) + "...",
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        saisenBalance: user.saisenBalance,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
      },
      token,
    })
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

// デバッグ用のGETエンドポイント
export async function GET() {
  const { getActiveTokens, getAllMockUsers } = await import("@/lib/mock-auth")
  const activeTokens = getActiveTokens()
  const users = getAllMockUsers()

  return NextResponse.json({
    message: "Mock login API is accessible",
    usersCount: users.length,
    activeTokensCount: Object.keys(activeTokens).length,
    availableUsers: users.map((u) => ({ email: u.email, username: u.username })),
  })
}
