import { type NextRequest, NextResponse } from "next/server"

// 簡単なメモリストレージ（他のAPIと同期）
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@kami.app",
    saisenBalance: 10000,
    isAdmin: true,
    isSuperAdmin: true,
  },
  {
    id: "2",
    username: "user1",
    email: "user1@kami.app",
    saisenBalance: 1000,
    isAdmin: false,
    isSuperAdmin: false,
  },
]

const activeTokens: Record<string, string> = {}

function getUserFromToken(token: string) {
  console.log("Getting user from token for user-info:", token.substring(0, 30) + "...")

  // アクティブトークンから検索
  const userId = activeTokens[token]
  if (userId) {
    const user = mockUsers.find((u) => u.id === userId)
    console.log("User found from active tokens:", user ? user.username : "not found")
    return user
  }

  // フォールバック: トークンを解析
  const parts = token.split("-")
  if (parts.length >= 3 && parts[0] === "mock" && parts[1] === "token") {
    const fallbackUserId = parts[2]
    const user = mockUsers.find((u) => u.id === fallbackUserId)
    if (user) {
      // アクティブトークンに追加
      activeTokens[token] = user.id
      console.log("User found via fallback for user-info:", user.username)
      return user
    }
  }

  console.log("No user found for token in user-info")
  return null
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== User Info API Called ===")

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.log("No token provided to user-info")
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    console.log("Token received in user-info:", token.substring(0, 30) + "...")

    const user = getUserFromToken(token)
    if (!user) {
      console.log("Invalid token in user-info")
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    console.log("User info retrieved:", { id: user.id, username: user.username, balance: user.saisenBalance })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        saisenBalance: user.saisenBalance,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      },
    })
  } catch (error) {
    console.error("User info API error:", error)
    return NextResponse.json(
      {
        error: "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
