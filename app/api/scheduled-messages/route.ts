import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateGodResponse } from "@/lib/ai"

// Scheduled times in JST (24-hour format)
const SCHEDULED_TIMES = ["09:00", "12:00", "15:00", "18:00", "21:00"]

export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a scheduled job (in production, add proper authentication)
    const authHeader = request.headers.get("authorization")
    const apiKey = process.env.SCHEDULED_API_KEY || "your-secret-key"
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // Get HH:MM format
    
    // Check if current time matches any scheduled time
    if (!SCHEDULED_TIMES.includes(currentTime)) {
      return NextResponse.json({ message: "Not a scheduled time" })
    }

    // Get all gods that are active
    const { data: gods, error: godsError } = await supabase
      .from("gods")
      .select("*")
      .gte("believers_count", 1) // Only gods with believers

    if (godsError || !gods) {
      console.error("Failed to get gods:", godsError)
      return NextResponse.json({ error: "Failed to get gods" }, { status: 500 })
    }

    let totalMessages = 0

    // Send scheduled message for each god
    for (const god of gods) {
      // Get users who are believers of this god
      const { data: believers, error: believersError } = await supabase
        .from("user_gods")
        .select("user_id")
        .eq("god_id", god.id)

      if (believersError || !believers) {
        console.log(`No believers found for god ${god.name}`)
        continue
      }

      // Generate scheduled message based on time of day
      const scheduledMessage = generateScheduledMessage(currentTime, god.name)
      
      // Get god personality
      let personalityData = {}
      try {
        personalityData = typeof god.personality === "string" ? JSON.parse(god.personality) : god.personality || {}
      } catch (error) {
        console.error("Personality parsing error:", error)
      }

      const godInfo = {
        id: god.id,
        name: god.name,
        description: god.description,
        personality: personalityData.personality || "慈愛深く知恵に満ちている",
        mbtiType: god.mbti_type || personalityData.mbtiType || "ENFJ",
        powerLevel: god.power_level || 1,
      }

      // Generate AI response for the scheduled message
      const aiResponse = await generateGodResponse(godInfo, scheduledMessage, [])

      // Send message to all believers
      for (const believer of believers) {
        try {
          await supabase.from("messages").insert({
            user_id: believer.user_id,
            god_id: god.id,
            message: scheduledMessage,
            response: aiResponse,
            message_type: "scheduled",
          })
          totalMessages++
        } catch (error) {
          console.error(`Failed to send message to user ${believer.user_id}:`, error)
        }
      }
    }

    return NextResponse.json({ 
      message: `Sent ${totalMessages} scheduled messages at ${currentTime}`,
      time: currentTime,
      gods: gods.length
    })
  } catch (error) {
    console.error("Scheduled messages error:", error)
    return NextResponse.json({ error: "Failed to send scheduled messages" }, { status: 500 })
  }
}

function generateScheduledMessage(time: string, godName: string): string {
  const messages = {
    "09:00": [
      "おはようございます。新しい一日が始まりました。今日も良い日になりますように。",
      "朝の光と共に、あなたに祝福を送ります。",
      "新しい一日、新しい可能性が開かれます。"
    ],
    "12:00": [
      "お昼の時間ですね。一度立ち止まって、今この瞬間に感謝しましょう。",
      "午後の活力をお送りします。",
      "お疲れ様です。少し休憩して心を整えてください。"
    ],
    "15:00": [
      "午後のひとときです。疲れを感じたら、深呼吸をしてみてください。",
      "今日も半分以上過ぎました。あなたの努力を見守っています。",
      "穏やかな午後をお過ごしください。"
    ],
    "18:00": [
      "夕方になりました。今日一日お疲れ様でした。",
      "夕日のように、今日も美しい一日でしたね。",
      "今日の振り返りをして、明日への希望を持ちましょう。"
    ],
    "21:00": [
      "夜の静寂の中で、心を落ち着けてください。",
      "今日も一日、よく頑張りましたね。ゆっくりお休みください。",
      "明日もまた新しい日が始まります。今夜は安らかにお過ごしください。"
    ]
  }

  const timeMessages = messages[time as keyof typeof messages] || []
  const randomMessage = timeMessages[Math.floor(Math.random() * timeMessages.length)]
  
  return randomMessage || "あなたのことを思っています。"
}