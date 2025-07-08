"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth-store"
import { Home, Users, MessageCircle, Search, Settings, LogOut, Crown, Coins, Mail } from "lucide-react"

export default function Navbar() {
  const { user, logout, token } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    console.log("Logout clicked")
    logout()
    router.push("/login")
  }

  // Don't render navbar if no user or token
  if (!user || !token) {
    console.log("Navbar: No user or token, not rendering")
    return null
  }

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-purple-700 border-b border-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">kAmI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-purple-800">
                <Home className="h-4 w-4 mr-2" />
                ホーム
              </Button>
            </Link>

            <Link href="/gods">
              <Button variant="ghost" size="sm" className="text-white hover:bg-purple-800">
                <Users className="h-4 w-4 mr-2" />
                神様一覧
              </Button>
            </Link>

            <Link href="/timeline">
              <Button variant="ghost" size="sm" className="text-white hover:bg-purple-800">
                <MessageCircle className="h-4 w-4 mr-2" />
                タイムライン
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="ghost" size="sm" className="text-white hover:bg-purple-800">
                <Mail className="h-4 w-4 mr-2" />
                お問い合わせ
              </Button>
            </Link>

            <div className="flex items-center space-x-2 bg-purple-800 px-3 py-1 rounded-full">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{user.saisenBalance}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    プロフィール
                  </Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Crown className="mr-2 h-4 w-4" />
                      管理者画面
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
