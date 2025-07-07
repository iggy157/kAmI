import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromToken } from "@/lib/auth"
import { generateGodResponse } from "@/lib/ai"

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

    const { godId, message } = await request.json()

    if (!godId || !message) {
      return NextResponse.json({ error: "神様IDとメッセージは必須です" }, { status: 400 })
    }

    // 神様の情報を取得
    const { data: god, error: godError } = await supabase.from("gods").select("*").eq("id", godId).single()

    if (godError || !god) {
      return NextResponse.json({ error: "神様が見つかりません" }, { status: 404 })
    }

    // 過去の会話履歴を取得
    const { data: conversationHistory } = await supabase
      .from("messages")
      .select("message, response")
      .eq("user_id", user.id)
      .eq("god_id", godId)
      .not("response", "is", null)
      .order("created_at", { ascending: false })
      .limit(5)

    // 神様の個性情報を解析
    let personalityData = {}
    try {
      personalityData = typeof god.personality === "string" ? JSON.parse(god.personality) : god.personality || {}
    } catch (error) {
      console.error("Personality parsing error:", error)
    }

    const godInfo = {
      id: god.id,
      name: god.name,
      description: god.description,
      personality: personalityData.personality || "慈愛深く知恵に満ちている",
      mbtiType: god.mbti_type || personalityData.mbtiType || "ENFJ",
      powerLevel: god.power_level || 1,
    }

    // AIを使って神様の返答を生成
    const response = await generateGodResponse(godInfo, message, conversationHistory || [])

    // メッセージと返答をデータベースに保存
    const { error: messageError } = await supabase.from("messages").insert({
      user_id: user.id,
      god_id: godId,
      message: message,
      response: response,
      message_type: "user",
    })

    if (messageError) {
      console.error("Message save error:", messageError)
    }

    return NextResponse.json({
      response,
      godName: god.name,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "チャットの処理に失敗しました" }, { status: 500 })
  }
}
