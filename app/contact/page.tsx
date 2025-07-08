"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuthStore } from "@/store/auth-store"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, MessageCircle, AlertCircle, CheckCircle } from "lucide-react"
import Navbar from "@/components/layout/navbar"
import { toast } from "sonner"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function ContactPage() {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: user?.username || "",
      email: user?.email || "",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      await apiClient.post("/api/contact", data)
      toast.success("お問い合わせを送信しました")
      reset({
        name: user?.username || "",
        email: user?.email || "",
        subject: "",
        message: "",
      })
      
      // Refresh history if it's being shown
      if (showHistory) {
        await fetchContactHistory()
      }
    } catch (error) {
      console.error("Contact form error:", error)
      toast.error("送信に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchContactHistory = async () => {
    if (!user) return

    try {
      const data = await apiClient.get("/api/contact/history")
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error("Failed to fetch contact history:", error)
      toast.error("履歴の取得に失敗しました")
    }
  }

  const toggleHistory = async () => {
    if (!showHistory) {
      await fetchContactHistory()
    }
    setShowHistory(!showHistory)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />対応待ち</Badge>
      case "in_progress":
        return <Badge variant="default"><MessageCircle className="h-3 w-3 mr-1" />対応中</Badge>
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />完了</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">お問い合わせ</h1>
          <p className="text-purple-700">ご質問やご要望がございましたら、お気軽にお問い合わせください</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                お問い合わせフォーム
              </CardTitle>
              <CardDescription>
                お困りのことやご意見・ご要望をお聞かせください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">お名前</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "お名前は必須です" })}
                    className="border-purple-300 focus:border-purple-500"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "メールアドレスは必須です",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "有効なメールアドレスを入力してください",
                      },
                    })}
                    className="border-purple-300 focus:border-purple-500"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">件名</Label>
                  <Input
                    id="subject"
                    {...register("subject", { required: "件名は必須です" })}
                    placeholder="お問い合わせの内容を簡潔に..."
                    className="border-purple-300 focus:border-purple-500"
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">メッセージ</Label>
                  <Textarea
                    id="message"
                    {...register("message", { required: "メッセージは必須です" })}
                    placeholder="詳細な内容をお書きください..."
                    className="min-h-[120px] border-purple-300 focus:border-purple-500"
                    maxLength={2000}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? "送信中..." : "送信する"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information & FAQ */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>よくある質問</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-900">Q. 神様を作成できません</h4>
                  <p className="text-sm text-gray-600">
                    神様の作成には500賽銭が必要です。賽銭残高をご確認ください。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Q. パスワードを忘れました</h4>
                  <p className="text-sm text-gray-600">
                    現在、パスワードリセット機能は準備中です。お問い合わせフォームからご連絡ください。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Q. アカウントを削除したい</h4>
                  <p className="text-sm text-gray-600">
                    アカウント削除をご希望の場合は、お問い合わせフォームからご連絡ください。
                  </p>
                </div>
              </CardContent>
            </Card>

            {user && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>お問い合わせ履歴</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleHistory}
                    >
                      {showHistory ? "非表示" : "表示"}
                    </Button>
                  </div>
                </CardHeader>
                {showHistory && (
                  <CardContent>
                    {submissions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        まだお問い合わせはありません
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {submissions.slice(0, 5).map((submission) => (
                          <div key={submission.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">{submission.subject}</h4>
                              {getStatusBadge(submission.status)}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {submission.message.length > 100
                                ? `${submission.message.substring(0, 100)}...`
                                : submission.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(submission.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}