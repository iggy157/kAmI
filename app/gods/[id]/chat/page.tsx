"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crown, Users, ArrowLeft, Send, RefreshCw, MessageCircle } from "lucide-react"
import Navbar from "@/components/layout/navbar"
import Link from "next/link"
import { toast } from "sonner"

interface God {
  id: string
  name: string
  description: string
  image_url?: string
  personality: any
  mbti_type: string
  believers_count: number
  power_level: number
  created_at: string
}

interface Message {
  id: string
  message: string
  response: string
  created_at: string
  message_type: string
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { user, token, isTokenValid } = useAuthStore()
  const router = useRouter()
  const [god, setGod] = useState<God | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!user || !token || !isTokenValid()) {
      router.push("/login")
      return
    }
    
    fetchGodAndMessages()
    
    // Set up auto-refresh every 10 seconds when enabled
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMessages(true)
      }, 10000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [user, token, router, params.id, autoRefresh, isTokenValid])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchGodAndMessages = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchGod(), fetchMessages()])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGod = async () => {
    try {
      const response = await apiClient.get(`/api/gods/${params.id}`)
      setGod(response.god)
    } catch (error) {
      console.error("Failed to fetch god:", error)
      setError("神様の情報を取得できませんでした")
    }
  }

  const fetchMessages = async (silent = false) => {
    try {
      const response = await apiClient.get(`/api/gods/${params.id}/messages`)
      setMessages(response.messages || [])
    } catch (error) {
      if (!silent) {
        console.error("Failed to fetch messages:", error)
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || chatLoading) return

    setChatLoading(true)
    const messageToSend = newMessage.trim()
    setNewMessage("")

    try {
      const response = await apiClient.post("/api/chat", {
        godId: params.id,
        message: messageToSend,
      })

      // Add the new message to the local state immediately
      const newMsg: Message = {
        id: Date.now().toString(),
        message: messageToSend,
        response: response.response,
        created_at: new Date().toISOString(),
        message_type: "user",
      }

      setMessages(prev => [...prev, newMsg])
      toast.success("神託を受け取りました")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("メッセージの送信に失敗しました")
      setNewMessage(messageToSend) // Restore the message
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-xl text-purple-800">神様との対話を準備中...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/gods/${params.id}`}>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              神様の詳細に戻る
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMessages()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              更新
            </Button>

            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {autoRefresh ? "自動更新ON" : "自動更新OFF"}
            </Button>
          </div>
        </div>

        {/* God Info Header */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={god.image_url || undefined} />
                <AvatarFallback className="text-xl bg-purple-600 text-white">
                  {god.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-purple-900">{god.name}</h1>
                <p className="text-gray-700">{god.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    信者数: {god.believers_count}
                  </Badge>
                  <Badge variant="outline">パワーレベル: {god.power_level}</Badge>
                  <Badge variant="outline">{god.mbti_type}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              神託の間
            </CardTitle>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[450px] p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">まだ対話がありません</p>
                  <p className="text-sm text-gray-400">神様に最初のメッセージを送ってみましょう</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-3">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="max-w-[70%] bg-purple-600 text-white rounded-lg p-3">
                          <p className="whitespace-pre-wrap">{message.message}</p>
                          <p className="text-xs text-purple-200 mt-1">{formatDate(message.created_at)}</p>
                        </div>
                      </div>

                      {/* God Response */}
                      {message.response && (
                        <div className="flex justify-start">
                          <div className="max-w-[70%] bg-gray-100 border-l-4 border-l-purple-500 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={god.image_url || undefined} />
                                <AvatarFallback className="text-xs bg-purple-600 text-white">
                                  {god.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-purple-900">{god.name}</span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{message.response}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <CardContent className="p-4 border-t">
            <div className="flex gap-3">
              <Textarea
                placeholder="神様に何を聞きたいですか？"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] resize-none"
                maxLength={1000}
                disabled={chatLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || chatLoading}
                className="bg-purple-600 hover:bg-purple-700 h-[60px] px-6"
              >
                {chatLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Shift + Enter で改行</span>
              <span>{newMessage.length}/1000</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}