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

    // Get god details
    const { data: god, error } = await supabase
      .from("gods")
      .select("*")
      .eq("id", godId)
      .single()

    if (error || !god) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "神様が見つかりません" }, { status: 404 })
    }

    return NextResponse.json({ god })
  } catch (error) {
    console.error("Get god error:", error)
    return NextResponse.json({ error: "神様の取得に失敗しました" }, { status: 500 })
  }
}