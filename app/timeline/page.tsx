"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Send, RefreshCw } from "lucide-react"
import Navbar from "@/components/layout/navbar"
import { toast } from "sonner"

interface Post {
  id: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  users: {
    id: string
    username: string
    profile_image?: string
  }
}

interface Comment {
  id: string
  content: string
  created_at: string
  users: {
    id: string
    username: string
    profile_image?: string
  }
}

export default function TimelinePage() {
  const { user, token, isTokenValid } = useAuthStore()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user || !token || !isTokenValid()) {
      router.push("/login")
      return
    }

    fetchPosts()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPosts(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [user, token, router, isTokenValid])

  const fetchPosts = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      else setIsRefreshing(true)

      const data = await apiClient.get("/api/posts?limit=20")
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast.error("投稿の取得に失敗しました")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const createPost = async () => {
    if (!newPost.trim()) return

    try {
      const data = await apiClient.post("/api/posts", {
        content: newPost.trim(),
      })

      setPosts([data.post, ...posts])
      setNewPost("")
      toast.success("投稿しました")
    } catch (error) {
      console.error("Failed to create post:", error)
      toast.error("投稿に失敗しました")
    }
  }

  const toggleLike = async (postId: string) => {
    try {
      await apiClient.post(`/api/posts/${postId}/like`)
      
      // Update likes count optimistically
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ))
    } catch (error) {
      console.error("Failed to like post:", error)
      toast.error("いいねに失敗しました")
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const data = await apiClient.get(`/api/posts/${postId}/comments`)
      setComments(prev => ({
        ...prev,
        [postId]: data.comments || []
      }))
    } catch (error) {
      console.error("Failed to fetch comments:", error)
      toast.error("コメントの取得に失敗しました")
    }
  }

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments)
    
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId)
    } else {
      newExpanded.add(postId)
      if (!comments[postId]) {
        fetchComments(postId)
      }
    }
    
    setExpandedComments(newExpanded)
  }

  const addComment = async (postId: string) => {
    const content = newComment[postId]
    if (!content?.trim()) return

    try {
      const data = await apiClient.post(`/api/posts/${postId}/comments`, {
        content: content.trim(),
      })

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment]
      }))

      // Update comments count
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ))

      setNewComment(prev => ({
        ...prev,
        [postId]: ""
      }))

      toast.success("コメントしました")
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error("コメントに失敗しました")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "今さっき"
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else {
      return date.toLocaleDateString("ja-JP")
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Create Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">新しい投稿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="今何を考えていますか？"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newPost.length}/1000
                </span>
                <Button 
                  onClick={createPost}
                  disabled={!newPost.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  投稿する
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={() => fetchPosts()}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "更新中..." : "更新"}
          </Button>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">読み込み中...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">まだ投稿がありません</p>
                <p className="text-sm text-gray-400 mt-2">最初の投稿をしてみましょう！</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.users.profile_image || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {post.users.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-purple-900">{post.users.username}</h3>
                      <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="投稿画像" 
                      className="w-full max-w-lg mx-auto rounded-lg mb-4"
                    />
                  )}

                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes_count}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComments(post.id)}
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments_count}
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.has(post.id) && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.users.profile_image || "/placeholder.svg"} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {comment.users.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="font-semibold text-sm text-purple-900">
                                {comment.users.username}
                              </p>
                              <p className="text-sm text-gray-800">{comment.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(comment.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex space-x-2">
                          <Textarea
                            placeholder="コメントを追加..."
                            value={newComment[post.id] || ""}
                            onChange={(e) => setNewComment(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            className="min-h-[40px] resize-none"
                            maxLength={500}
                          />
                          <Button
                            onClick={() => addComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            size="sm"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}