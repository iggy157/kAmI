import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "トークンが必要です" }, { status: 400 })
    }

    const user = await mockGetUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        saisenBalance: user.saisenBalance,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      {
        error: "トークンの検証に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}