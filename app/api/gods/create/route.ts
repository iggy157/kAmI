import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
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
    if (user.saisenBalance < CREATION_COST) {
      return NextResponse.json(
        { error: `神様作成には${CREATION_COST}賽銭が必要です。現在の残高: ${user.saisenBalance}賽銭` },
        { status: 400 },
      )
    }

    // 神様を作成
    const { data: god, error: godError } = await supabase
      .from("gods")
      .insert({
        name,
        description,
        image_url: imageUrl,
        personality: JSON.stringify({
          personality,
          mbtiType,
          speechStyle,
          actionStyle,
          likes,
          dislikes,
          bigFiveTraits,
        }),
        mbti_type: mbtiType,
        creator_id: user.id,
        believers_count: 0,
        power_level: 1,
        total_offerings: 0,
      })
      .select()
      .single()

    if (godError) {
      console.error("God creation error:", godError)
      return NextResponse.json({ error: "神様の作成に失敗しました" }, { status: 500 })
    }

    // ユーザーの賽銭残高を更新
    const { error: balanceError } = await supabase
      .from("users")
      .update({ saisen_balance: user.saisenBalance - CREATION_COST })
      .eq("id", user.id)

    if (balanceError) {
      console.error("Balance update error:", balanceError)
      // 神様作成は成功したが残高更新に失敗した場合のログ
    }

    return NextResponse.json({
      message: "神様が正常に作成されました！",
      godId: god.id,
      newBalance: user.saisenBalance - CREATION_COST,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
