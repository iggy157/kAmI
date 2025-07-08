import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    // Get contact form submissions for this user
    const { data: submissions, error } = await supabase
      .from("contact_forms")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "履歴の取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Contact history error:", error)
    return NextResponse.json({ error: "履歴の取得に失敗しました" }, { status: 500 })
  }
}