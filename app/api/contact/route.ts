import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "すべての項目は必須です" }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "お名前は100文字以内で入力してください" }, { status: 400 })
    }

    if (subject.length > 200) {
      return NextResponse.json({ error: "件名は200文字以内で入力してください" }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "メッセージは2000文字以内で入力してください" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 })
    }

    // Get user if authenticated (optional)
    let userId = null
    const authorization = request.headers.get("authorization")
    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.split(" ")[1]
      const user = await getUserFromToken(token)
      if (user) {
        userId = user.id
      }
    }

    // Save contact form submission
    const { data: contact, error } = await supabase
      .from("contact_forms")
      .insert({
        user_id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "お問い合わせの送信に失敗しました" }, { status: 500 })
    }

    // In a real application, you might want to send an email notification here
    console.log("New contact form submission:", {
      id: contact.id,
      name,
      email,
      subject,
    })

    return NextResponse.json({ 
      message: "お問い合わせを受け付けました",
      id: contact.id
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "お問い合わせの送信に失敗しました" }, { status: 500 })
  }
}