import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockUpdateUserBalance, mockCreateGod, getActiveTokens } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    console.log("=== God Creation API Called ===")

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    console.log("🔑 Token received:", token.substring(0, 30) + "...")
    console.log("📊 Active tokens count:", Object.keys(getActiveTokens()).length)

    const user = await mockGetUserFromToken(token)
    if (!user) {
      console.log("❌ Invalid token - user not found")
      console.log(
        "🔍 Available active tokens:",
        Object.keys(getActiveTokens()).map((t) => t.substring(0, 20) + "..."),
      )
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    console.log("✅ User authenticated:", {
      id: user.id,
      username: user.username,
      balance: user.saisenBalance,
    })

    const body = await request.json()
    console.log("📝 Request body keys:", Object.keys(body))

    const {
      name,
      description,
      personality,
      mbtiType,
      category,
      colorTheme,
      imageUrl,
      deity,
      beliefs,
      specialSkills,
      speechStyle,
      actionStyle,
      likes,
      dislikes,
      relationshipWithHumans,
      relationshipWithFollowers,
      limitations,
      bigFiveTraits,
    } = body

    // 賽銭残高チェック
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

    // 神様データを作成
    const godData = {
      name,
      description,
      imageUrl,
      personality: JSON.stringify({
        personality,
        mbtiType,
        speechStyle,
        actionStyle,
        likes,
        dislikes,
        bigFiveTraits,
        deity,
        beliefs,
        specialSkills,
        relationshipWithHumans,
        relationshipWithFollowers,
        limitations,
      }),
      mbtiType,
      category,
      colorTheme,
      creatorId: user.id,
      believersCount: 0,
      powerLevel: 1,
      totalOfferings: 0,
    }

    console.log("🏗️ Creating god:", { name, category, mbtiType })

    // 神様を作成
    const godId = await mockCreateGod(godData)
    console.log("✅ God created with ID:", godId)

    // ユーザーの賽銭残高を更新
    const newBalance = user.saisenBalance - CREATION_COST
    const balanceUpdated = await mockUpdateUserBalance(user.id, newBalance)

    if (!balanceUpdated) {
      console.log("⚠️ Failed to update balance")
    } else {
      console.log("✅ Balance updated successfully:", newBalance)
    }

    const response = {
      message: "神様が正常に作成されました！",
      godId: godId,
      newBalance: newBalance,
      god: { id: godId, ...godData },
    }

    console.log("🎉 God creation completed successfully")
    return NextResponse.json(response)
  } catch (error) {
    console.error("💥 God creation API error:", error)
    return NextResponse.json(
      {
        error: "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
