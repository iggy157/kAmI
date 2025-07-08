"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Users, Heart, MessageCircle, ArrowLeft } from "lucide-react"
import Navbar from "@/components/layout/navbar"
import Link from "next/link"

interface God {
  id: string
  name: string
  description: string
  imageUrl?: string
  personality: any
  mbtiType: string
  category: string
  colorTheme: string
  believersCount: number
  powerLevel: number
  createdAt: string
}

export default function GodDetailPage({ params }: { params: { id: string } }) {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const [god, setGod] = useState<God | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }
    fetchGodDetails()
  }, [user, token, router, params.id])

  const fetchGodDetails = async () => {
    try {
      // モックデータから神様を取得
      const mockGods = JSON.parse(localStorage.getItem("created_gods") || "[]")
      const foundGod = mockGods.find((g: any) => g.id === params.id)

      if (foundGod) {
        setGod(foundGod)
      } else {
        setError("神様が見つかりません")
      }
    } catch (error) {
      console.error("Failed to fetch god details:", error)
      setError("神様の情報を取得できませんでした")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-xl text-purple-800">神様の情報を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !god) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">神様が見つかりません</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/dashboard">
                <Button>ダッシュボードに戻る</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const personalityData = typeof god.personality === "string" ? JSON.parse(god.personality) : god.personality

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </div>

        {/* 神様情報カード */}
        <Card className="mb-8 overflow-hidden">
          <div
            className="h-32 relative"
            style={{
              background:
                god.colorTheme === "mystic_purple"
                  ? "linear-gradient(135deg, #6a1b9a 0%, #ab47bc 50%, #ce93d8 100%)"
                  : "linear-gradient(135deg, #6a1b9a 0%, #ab47bc 50%, #ce93d8 100%)",
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <CardContent className="relative -mt-16 p-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={god.imageUrl || undefined} />
                <AvatarFallback className="text-4xl bg-purple-600 text-white">{god.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-purple-900 mb-2">{god.name}</h1>
                <p className="text-lg text-gray-700 mb-4">{god.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default" className="bg-purple-600">
                    {god.category}
                  </Badge>
                  <Badge variant="outline">{god.mbtiType}</Badge>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    信者数: {god.believersCount}
                  </Badge>
                  <Badge variant="secondary">パワーレベル: {god.powerLevel}</Badge>
                </div>

                <div className="flex gap-4">
                  <Link href={`/gods/${params.id}/chat`}>
                    <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                      <MessageCircle className="h-4 w-4" />
                      神託を求める
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Heart className="h-4 w-4" />
                    信者になる
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 詳細情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🧠 性格・特徴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalityData.personality && (
                <div>
                  <h4 className="font-semibold text-purple-900">性格</h4>
                  <p className="text-gray-700">{personalityData.personality}</p>
                </div>
              )}
              {personalityData.speechStyle && (
                <div>
                  <h4 className="font-semibold text-purple-900">口調</h4>
                  <p className="text-gray-700">{personalityData.speechStyle}</p>
                </div>
              )}
              {personalityData.likes && (
                <div>
                  <h4 className="font-semibold text-purple-900">好きなこと</h4>
                  <p className="text-gray-700">{personalityData.likes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ 神格・能力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalityData.deity && (
                <div>
                  <h4 className="font-semibold text-purple-900">神格</h4>
                  <p className="text-gray-700">{personalityData.deity}</p>
                </div>
              )}
              {personalityData.beliefs && (
                <div>
                  <h4 className="font-semibold text-purple-900">信念</h4>
                  <p className="text-gray-700">{personalityData.beliefs}</p>
                </div>
              )}
              {personalityData.specialSkills && (
                <div>
                  <h4 className="font-semibold text-purple-900">特技</h4>
                  <div className="flex flex-wrap gap-1">
                    {personalityData.specialSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 作成日時 */}
        <Card className="mt-6">
          <CardContent className="p-4 text-center text-gray-600">
            <p>
              開宗日:{" "}
              {new Date(god.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
