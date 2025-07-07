import { type NextRequest, NextResponse } from "next/server"

// 簡単なメモリストレージ
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@kami.app",
    saisenBalance: 10000,
    isAdmin: true,
  },
  {
    id: "2",
    username: "user1",
    email: "user1@kami.app",
    saisenBalance: 1000,
    isAdmin: false,
  },
]

const mockGods: any[] = []
const activeTokens: Record<string, string> = {}

// トークンからユーザーを取得する関数
function getUserFromToken(token: string) {
  console.log("Getting user from token:", token.substring(0, 30) + "...")

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
      console.log("User found via fallback:", user.username)
      return user
    }
  }

  console.log("No user found for token")
  return null
}

export async function GET() {
  return NextResponse.json({
    message: "God creation API is accessible",
    timestamp: new Date().toISOString(),
    activeTokensCount: Object.keys(activeTokens).length,
    usersCount: mockUsers.length,
    godsCount: mockGods.length,
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== God Creation API Called ===")
    console.log("Request URL:", request.url)
    console.log("Request method:", request.method)

    // ヘッダーをチェック
    const authHeader = request.headers.get("authorization")
    console.log("Authorization header:", authHeader ? authHeader.substring(0, 50) + "..." : "Missing")

    if (!authHeader) {
      console.log("❌ No authorization header")
      return NextResponse.json({ error: "認証ヘッダーが必要です" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    if (!token) {
      console.log("❌ No token in authorization header")
      return NextResponse.json({ error: "認証トークンが必要です" }, { status: 401 })
    }

    console.log("🔑 Token extracted:", token.substring(0, 30) + "...")

    // ユーザー認証
    const user = getUserFromToken(token)
    if (!user) {
      console.log("❌ User not found for token")
      console.log("Available active tokens:", Object.keys(activeTokens).length)
      console.log(
        "Available users:",
        mockUsers.map((u) => u.username),
      )
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    console.log("✅ User authenticated:", {
      id: user.id,
      username: user.username,
      balance: user.saisenBalance,
    })

    // リクエストボディを取得
    let body
    try {
      body = await request.json()
      console.log("📝 Request body parsed successfully")
      console.log("Body keys:", Object.keys(body))
    } catch (error) {
      console.log("❌ Failed to parse request body:", error)
      return NextResponse.json({ error: "リクエストボディの解析に失敗しました" }, { status: 400 })
    }

    const { name, description, category, mbtiType } = body
    console.log("📋 God data:", { name, category, mbtiType })

    // 残高チェック
    const CREATION_COST = 500
    console.log("💰 Balance check:", {
      userBalance: user.saisenBalance,
      cost: CREATION_COST,
      sufficient: user.saisenBalance >= CREATION_COST,
    })

    if (user.saisenBalance < CREATION_COST) {
      console.log("❌ Insufficient balance")
      return NextResponse.json(
        { error: `神様作成には${CREATION_COST}賽銭が必要です。現在の残高: ${user.saisenBalance}賽銭` },
        { status: 400 },
      )
    }

    // 神様を作成
    const godId = `god_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const god = {
      id: godId,
      name: name || "無名の神",
      description: description || "神秘的な神様",
      category: category || "その他",
      mbtiType: mbtiType || "INFJ",
      creatorId: user.id,
      believersCount: 0,
      powerLevel: 1,
      createdAt: new Date().toISOString(),
      ...body, // 他のデータも保存
    }

    mockGods.push(god)
    console.log("✅ God created:", godId)

    // 残高を更新
    const userIndex = mockUsers.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex].saisenBalance -= CREATION_COST
      console.log("✅ Balance updated:", mockUsers[userIndex].saisenBalance)
    }

    const response = {
      message: "神様が正常に作成されました！",
      godId: godId,
      newBalance: mockUsers[userIndex]?.saisenBalance || user.saisenBalance - CREATION_COST,
      god: god,
    }

    console.log("🎉 God creation completed successfully")
    return NextResponse.json(response)
  } catch (error) {
    console.error("💥 God creation API error:", error)
    return NextResponse.json(
      {
        error: "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
