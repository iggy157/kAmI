import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockUpdateUserBalance, mockCreateGod, getActiveTokens } from "@/lib/mock-auth"

export async function GET() {
  const activeTokens = getActiveTokens()
  return NextResponse.json({
    message: "God creation API is accessible",
    timestamp: new Date().toISOString(),
    activeTokensCount: Object.keys(activeTokens).length,
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
    const user = await mockGetUserFromToken(token)
    if (!user) {
      console.log("❌ User not found for token")
      const activeTokens = getActiveTokens()
      console.log("Available active tokens:", Object.keys(activeTokens).length)
      console.log("Active token keys:", Object.keys(activeTokens))
      console.log("Provided token:", token)
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
    const godData = {
      name: name || "無名の神",
      description: description || "神秘的な神様",
      category: category || "その他",
      mbtiType: mbtiType || "INFJ",
      creatorId: user.id,
      believersCount: 0,
      powerLevel: 1,
      ...body, // 他のデータも保存
    }

    const godId = await mockCreateGod(godData)
    console.log("✅ God created:", godId)

    // 残高を更新
    const newBalance = user.saisenBalance - CREATION_COST
    await mockUpdateUserBalance(user.id, newBalance)
    console.log("✅ Balance updated:", newBalance)

    const response = {
      message: "神様が正常に作成されました！",
      godId: godId,
      newBalance: newBalance,
      god: {
        id: godId,
        ...godData,
        createdAt: new Date().toISOString(),
      },
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
