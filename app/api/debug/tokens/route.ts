import { type NextRequest, NextResponse } from "next/server"
import { getActiveTokens, getAllMockUsers } from "@/lib/mock-auth"

export async function GET(request: NextRequest) {
  try {
    const activeTokens = getActiveTokens()
    const users = getAllMockUsers()

    // リクエストヘッダーからトークンを取得
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    console.log("=== Token Debug Info ===")
    console.log("Request token:", token ? token.substring(0, 30) + "..." : "No token")
    console.log("Active tokens count:", Object.keys(activeTokens).length)
    console.log(
      "Active tokens:",
      Object.keys(activeTokens).map((t) => t.substring(0, 30) + "..."),
    )
    console.log("Users count:", users.length)

    return NextResponse.json({
      message: "Token debug info",
      requestToken: token ? token.substring(0, 30) + "..." : "No token",
      activeTokensCount: Object.keys(activeTokens).length,
      activeTokens: Object.keys(activeTokens).map((t) => t.substring(0, 30) + "..."),
      usersCount: users.length,
      users: users.map((u) => ({ id: u.id, username: u.username, email: u.email })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        error: "Debug API failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
