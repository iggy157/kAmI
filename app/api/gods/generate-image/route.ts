import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const body = await request.json()
    const { name, deity, personality, bigFiveTraits, mbtiType, category, colorTheme, beliefs, special_skills } = body

    // AIを使って画像生成用のプロンプトを作成
    const promptGenerationRequest = `
以下の神様の情報を基に、画像生成AIに適した英語のプロンプトを作成してください。
アニメ風で神秘的な雰囲気の神様のイラストを生成するためのプロンプトです。

神様の情報:
- 名前: ${name}
- 神格: ${deity}
- 性格: ${personality}
- 信念: ${beliefs}
- 特技: ${special_skills}
- MBTI: ${mbtiType}
- カテゴリ: ${category}
- カラーテーマ: ${colorTheme}
- 性格特性: ${JSON.stringify(bigFiveTraits)}

以下の形式で英語プロンプトを作成してください:
"anime style, mystical deity, [神様の特徴], [色彩情報], [雰囲気], high quality, detailed"

日本語の説明は不要で、英語プロンプトのみを返してください。
`

    const { text: imagePrompt } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: promptGenerationRequest,
    })

    // 実際の画像生成はここでは模擬的に処理
    // 本来はDALL-E、Midjourney、Stable Diffusion等のAPIを使用
    const mockImageUrl = `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(name)}`

    return NextResponse.json({
      imageUrl: mockImageUrl,
      prompt: imagePrompt.trim(),
      message: "神様の画像を生成しました！（デモ版では模擬画像を表示しています）",
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json({ error: "画像の生成に失敗しました" }, { status: 500 })
  }
}
