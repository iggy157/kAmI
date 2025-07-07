import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken } from "@/lib/mock-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("User info API called")

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    console.log("Token received:", token.substring(0, 20) + "...")

    const user = await mockGetUserFromToken(token)
    if (!user) {
      console.log("Invalid token")
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    console.log("User info retrieved:", { id: user.id, username: user.username, balance: user.saisenBalance })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        saisenBalance: user.saisenBalance,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      },
    })
  } catch (error) {
    console.error("User info API error:", error)
    return NextResponse.json(
      {
        error: "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
