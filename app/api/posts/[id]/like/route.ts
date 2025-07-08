import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromToken } from "@/lib/auth"

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

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .single()

    if (existingLike) {
      return NextResponse.json({ error: "既にいいねしています" }, { status: 400 })
    }

    // Add like
    const { error: likeError } = await supabase
      .from("post_likes")
      .insert({
        user_id: user.id,
        post_id: postId,
      })

    if (likeError) {
      console.error("Like error:", likeError)
      return NextResponse.json({ error: "いいねに失敗しました" }, { status: 500 })
    }

    // Update likes count
    const { error: updateError } = await supabase.rpc("increment_post_likes", {
      post_id: postId,
    })

    if (updateError) {
      console.error("Update likes count error:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Like post error:", error)
    return NextResponse.json({ error: "いいねに失敗しました" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Remove like
    const { error: unlikeError } = await supabase
      .from("post_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId)

    if (unlikeError) {
      console.error("Unlike error:", unlikeError)
      return NextResponse.json({ error: "いいね解除に失敗しました" }, { status: 500 })
    }

    // Update likes count
    const { error: updateError } = await supabase.rpc("decrement_post_likes", {
      post_id: postId,
    })

    if (updateError) {
      console.error("Update likes count error:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unlike post error:", error)
    return NextResponse.json({ error: "いいね解除に失敗しました" }, { status: 500 })
  }
}