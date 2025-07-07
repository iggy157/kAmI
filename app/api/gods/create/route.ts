import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const user = await mockGetUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const body = await request.json()
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
    console.log("User balance check:", { userBalance: user.saisenBalance, cost: CREATION_COST })

    if (user.saisenBalance < CREATION_COST) {
      return NextResponse.json(
        { error: `神様作成には${CREATION_COST}賽銭が必要です。現在の残高: ${user.saisenBalance}賽銭` },
        { status: 400 },
      )
    }

    // 神様データを作成（モック）
    const godId = `god_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const godData = {
      id: godId,
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
      createdAt: new Date().toISOString(),
    }

    // ローカルストレージに神様データを保存（デモ用）
    if (typeof window !== "undefined") {
      const existingGods = JSON.parse(localStorage.getItem("created_gods") || "[]")
      existingGods.push(godData)
      localStorage.setItem("created_gods", JSON.stringify(existingGods))
    }

    // ユーザーの賽銭残高を更新（モック）
    user.saisenBalance -= CREATION_COST

    console.log("God created successfully:", { godId, newBalance: user.saisenBalance })

    return NextResponse.json({
      message: "神様が正常に作成されました！",
      godId: godId,
      newBalance: user.saisenBalance,
      god: godData,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
