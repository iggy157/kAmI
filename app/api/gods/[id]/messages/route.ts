import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authorization = request.headers.get("authorization")
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const token = authorization.split(" ")[1]
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const godId = params.id

    // Get messages for this user and god
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .eq("god_id", godId)
      .not("response", "is", null)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "メッセージの取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "メッセージの取得に失敗しました" }, { status: 500 })
  }
}