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

    // Get total gods count
    const { count: totalGods } = await supabase.from("gods").select("*", { count: "exact", head: true })

    // Get total believers count (sum of all gods' believers)
    const { data: believersData } = await supabase.from("gods").select("believers_count")

    const totalBelievers = believersData?.reduce((sum, god) => sum + god.believers_count, 0) || 0

    // Get total messages count
    const { count: totalMessages } = await supabase.from("messages").select("*", { count: "exact", head: true })

    return NextResponse.json({
      totalGods: totalGods || 0,
      totalBelievers,
      totalMessages: totalMessages || 0,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
