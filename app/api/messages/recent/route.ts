import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        id,
        message,
        response,
        created_at,
        gods (name)
      `)
      .eq("user_id", user.id)
      .not("response", "is", null)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 })
    }

    const formattedMessages = messages.map((message) => ({
      id: message.id,
      message: message.message,
      response: message.response,
      godName: message.gods?.name || "不明な神様",
      createdAt: message.created_at,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
