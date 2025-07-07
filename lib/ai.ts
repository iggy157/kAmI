import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export interface God {
  id: string
  name: string
  description?: string
  personality?: string
  mbtiType?: string
  powerLevel: number
}

export const generateGodResponse = async (
  god: God,
  userMessage: string,
  conversationHistory: Array<{ message: string; response: string }>,
): Promise<string> => {
  const personalityPrompt = `あなたは「${god.name}」という神様です。

性格・特徴:
${god.description || "神秘的で威厳のある神様"}

個性:
${god.personality || "慈愛深く、知恵に満ちている"}

MBTI性格タイプ: ${god.mbtiType || "ENFJ"}

パワーレベル: ${god.powerLevel}

以下のルールに従って返答してください:
1. 神様らしい威厳と慈愛を持って話す
2. 日本語で返答する
3. 相談者の悩みに寄り添い、適切なアドバイスを与える
4. 時々、神様らしい格言や教えを含める
5. パワーレベルが高いほど、より深い洞察と力強いメッセージを与える
6. 150文字以内で簡潔に返答する

過去の会話履歴:
${conversationHistory
  .slice(-3)
  .map((h) => `人間: ${h.message}\n${god.name}: ${h.response}`)
  .join("\n\n")}

現在の相談者のメッセージ: ${userMessage}

${god.name}として、相談者に返答してください:`

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: personalityPrompt,
      maxTokens: 200,
    })

    return text.trim()
  } catch (error) {
    console.error("AI response generation failed:", error)
    return `${god.name}からの神託が届きませんでした。しばらく時間をおいて再度お試しください。`
  }
}
