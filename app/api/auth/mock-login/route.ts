import { type NextRequest, NextResponse } from "next/server"

// 簡単なメモリストレージ
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@kami.app",
    saisenBalance: 10000,
    isAdmin: true,
    isSuperAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "user1",
    email: "user1@kami.app",
    saisenBalance: 1000,
    isAdmin: false,
    isSuperAdmin: false,
    createdAt: new Date().toISOString(),
  },
]

const userPasswords: Record<string, string> = {
  "admin@kami.app": "admin123",
  "user1@kami.app": "user123",
}

const activeTokens: Record<string, string> = {}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Mock Login API Called ===")

    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードは必須です" }, { status: 400 })
    }

    // ユーザーを検索
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "メールアドレスまたはパスワードが間違っています" }, { status: 401 })
    }

    // パスワードチェック
    const storedPassword = userPasswords[email]
    if (!storedPassword || storedPassword !== password) {
      console.log("Password mismatch")
      return NextResponse.json({ error: "メールアドレスまたはパスワードが間違っています" }, { status: 401 })
    }

    // トークンを生成
    const token = `mock-token-${user.id}-${Date.now()}`

    // アクティブトークンに保存
    activeTokens[token] = user.id

    console.log("Login successful:", {
      userId: user.id,
      username: user.username,
      token: token.substring(0, 30) + "...",
      activeTokensCount: Object.keys(activeTokens).length,
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
  return NextResponse.json({
    message: "Mock login API is accessible",
    usersCount: mockUsers.length,
    activeTokensCount: Object.keys(activeTokens).length,
    availableUsers: mockUsers.map((u) => ({ email: u.email, username: u.username })),
  })
}
