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

    const { data: gods, error } = await supabase
      .from("gods")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 })
    }

    const formattedGods = gods.map((god) => ({
      id: god.id,
      name: god.name,
      description: god.description,
      imageUrl: god.image_url,
      believersCount: god.believers_count,
      powerLevel: god.power_level,
      createdAt: god.created_at,
    }))

    return NextResponse.json({ gods: formattedGods })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
