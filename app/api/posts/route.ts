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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get posts with user information, ordered by creation time
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        users (
          id,
          username,
          profile_image
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "投稿の取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "投稿の取得に失敗しました" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { content, image_url } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "投稿内容は必須です" }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "投稿内容は1000文字以内で入力してください" }, { status: 400 })
    }

    // Create new post
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content.trim(),
        image_url: image_url || null,
      })
      .select(`
        *,
        users (
          id,
          username,
          profile_image
        )
      `)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "投稿の作成に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "投稿の作成に失敗しました" }, { status: 500 })
  }
}