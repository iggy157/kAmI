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

    const postId = params.id

    // Get comments for the post
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        users (
          id,
          username,
          profile_image
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "コメントの取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "コメントの取得に失敗しました" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const postId = params.id
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "コメント内容は必須です" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "コメントは500文字以内で入力してください" }, { status: 400 })
    }

    // Create new comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        post_id: postId,
        content: content.trim(),
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
      return NextResponse.json({ error: "コメントの作成に失敗しました" }, { status: 500 })
    }

    // Update comments count
    const { error: updateError } = await supabase.rpc("increment_post_comments", {
      post_id: postId,
    })

    if (updateError) {
      console.error("Update comments count error:", updateError)
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "コメントの作成に失敗しました" }, { status: 500 })
  }
}