import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "God creation API route is accessible",
    timestamp: new Date().toISOString(),
    method: "GET",
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Test God Creation API Called ===")

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("Token received:", token ? token.substring(0, 30) + "..." : "No token")

    const body = await request.json()
    console.log("Body received:", Object.keys(body))

    return NextResponse.json({
      message: "Test API working",
      hasToken: !!token,
      bodyKeys: Object.keys(body),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json(
      {
        error: "Test API failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
