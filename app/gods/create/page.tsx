"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Crown,
  Sparkles,
  Heart,
  Brain,
  Users,
  Save,
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  Eye,
  Coins,
} from "lucide-react"
import Navbar from "@/components/layout/navbar"

interface FormData {
  name: string
  deity: string
  beliefs: string
  special_skills: string
  personality: string
  speech_style: string
  action_style: string
  likes: string
  dislikes: string
  relationship_with_humans: string
  relationship_with_followers: string
  limitations: string
  category: string
  colorTheme: string
  bigFiveTraits: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  mbtiType: string
  generatedImage: string | null
}

const CREATION_COST = 500
const STORAGE_KEY = "createGodFormData"

const steps = [
  { label: "基本情報", icon: Crown },
  { label: "神格・信念", icon: Sparkles },
  { label: "性格・行動", icon: Brain },
  { label: "人間関係", icon: Users },
  { label: "プレビュー", icon: Eye },
  { label: "開宗", icon: Heart },
]

const categories = [
  { value: "恋愛・人間関係", emoji: "💕", description: "恋愛や人間関係の悩みを解決" },
  { value: "仕事・キャリア", emoji: "💼", description: "キャリアアップや転職の相談" },
  { value: "健康・美容", emoji: "✨", description: "健康維持と美容のアドバイス" },
  { value: "学業・勉強", emoji: "📚", description: "学習効率と成績向上のサポート" },
  { value: "金運・お金", emoji: "💰", description: "金運向上と資産管理の指導" },
  { value: "趣味・娯楽", emoji: "🎮", description: "趣味を通じた人生の充実" },
  { value: "家族・育児", emoji: "👨‍👩‍👧‍👦", description: "家族関係と子育ての知恵" },
  { value: "その他", emoji: "🌟", description: "その他の人生相談全般" },
]

const mbtiTypes = [
  { code: "INTJ", name: "建築家", description: "戦略的思考に長け、計画を立てて実行する" },
  { code: "INTP", name: "論理学者", description: "革新的な発明家で、知識に対する飽くなき渇望を持つ" },
  { code: "ENTJ", name: "指揮官", description: "大胆で想像力豊か、意志の強い指導者" },
  { code: "ENTP", name: "討論者", description: "賢くて好奇心旺盛な思考家、知的挑戦を楽しむ" },
  { code: "INFJ", name: "提唱者", description: "静かで神秘的、人々を非常に鼓舞する理想主義者" },
  { code: "INFP", name: "仲介者", description: "詩的で親切な利他主義者、良い行いに熱心" },
  { code: "ENFJ", name: "主人公", description: "カリスマ性があり、人々を鼓舞する指導者" },
  { code: "ENFP", name: "運動家", description: "情熱的で独創的、社交的な自由人" },
  { code: "ISTJ", name: "管理者", description: "実用的で事実を重視する、信頼性の高い人" },
  { code: "ISFJ", name: "擁護者", description: "非常に献身的で温かい擁護者、いつも守る準備ができている" },
  { code: "ESTJ", name: "幹部", description: "優秀な管理者、物事を管理する能力に長けている" },
  { code: "ESFJ", name: "領事", description: "非常に思いやりがあり、社交的で人気者" },
  { code: "ISTP", name: "巨匠", description: "大胆で実践的な実験者、あらゆる道具の達人" },
  { code: "ISFP", name: "冒険家", description: "柔軟で魅力的なアーティスト、常に探求する準備ができている" },
  { code: "ESTP", name: "起業家", description: "賢くて精力的、非常に鋭い知覚の持ち主" },
  { code: "ESFP", name: "エンターテイナー", description: "自発的で精力的、熱心な人、周りを退屈させない" },
]

const bigFiveInfo = [
  {
    key: "openness",
    label: "開放性",
    description: "新しい経験への興味、創造性、芸術的感受性",
    lowLabel: "伝統的・慎重",
    highLabel: "革新的・冒険的",
  },
  {
    key: "conscientiousness",
    label: "誠実性",
    description: "自己規律、責任感、計画性の度合い",
    lowLabel: "柔軟・即興的",
    highLabel: "組織的・完璧主義",
  },
  {
    key: "extraversion",
    label: "外向性",
    description: "社交性、活動性、積極性の度合い",
    lowLabel: "内向的・控えめ",
    highLabel: "外向的・社交的",
  },
  {
    key: "agreeableness",
    label: "協調性",
    description: "他者への思いやり、協力的態度、信頼性",
    lowLabel: "競争的・批判的",
    highLabel: "協力的・思いやり",
  },
  {
    key: "neuroticism",
    label: "神経症傾向",
    description: "情緒の安定性、ストレス耐性（低いほど安定）",
    lowLabel: "情緒安定・冷静",
    highLabel: "感情的・繊細",
  },
]

const colorThemes = [
  {
    value: "mystic_purple",
    label: "神秘の紫",
    primary: "#8e24aa",
    gradient: "linear-gradient(135deg, #6a1b9a 0%, #ab47bc 50%, #ce93d8 100%)",
    description: "深遠なる知恵と神秘",
  },
  {
    value: "divine_gold",
    label: "神聖の金",
    primary: "#f57f17",
    gradient: "linear-gradient(135deg, #f57f17 0%, #ffb300 50%, #ffd54f 100%)",
    description: "豊穣と繁栄の象徴",
  },
  {
    value: "celestial_blue",
    label: "天空の青",
    primary: "#0277bd",
    gradient: "linear-gradient(135deg, #0277bd 0%, #03a9f4 50%, #81d4fa 100%)",
    description: "無限の空と清浄",
  },
  {
    value: "sacred_green",
    label: "聖なる緑",
    primary: "#2e7d32",
    gradient: "linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #81c784 100%)",
    description: "生命力と癒しの力",
  },
  {
    value: "flame_red",
    label: "情熱の炎",
    primary: "#c62828",
    gradient: "linear-gradient(135deg, #c62828 0%, #e53935 50%, #ef5350 100%)",
    description: "情熱と勇気の象徴",
  },
  {
    value: "ocean_teal",
    label: "深海の青緑",
    primary: "#00695c",
    gradient: "linear-gradient(135deg, #00695c 0%, #00897b 50%, #4db6ac 100%)",
    description: "深遠な海の静寂",
  },
]

export default function CreateGodPage() {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [imageGenerating, setImageGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState("")
  const [userBalance, setUserBalance] = useState(0)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    deity: "",
    beliefs: "",
    special_skills: "",
    personality: "",
    speech_style: "",
    action_style: "",
    likes: "",
    dislikes: "",
    relationship_with_humans: "",
    relationship_with_followers: "",
    limitations: "",
    category: "",
    colorTheme: "mystic_purple",
    bigFiveTraits: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    mbtiType: "",
    generatedImage: null,
  })

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }
    fetchUserBalance()
    loadSavedData()
  }, [user, token, router])

  // 自動保存
  useEffect(() => {
    const interval = setInterval(() => {
      saveDataToLocalStorage()
      setAutoSaveStatus("自動保存しました")
      setTimeout(() => setAutoSaveStatus(""), 3000)
    }, 30000)
    return () => clearInterval(interval)
  }, [formData])

  const fetchUserBalance = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUserBalance(user?.saisenBalance || 1000)
      }
    } catch (error) {
      console.error("残高取得エラー:", error)
      setUserBalance(user?.saisenBalance || 1000)
    }
  }

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setFormData(parsedData.formData || formData)
        setActiveStep(parsedData.activeStep || 0)
        setAutoSaveStatus("前回の入力データを復元しました")
        setTimeout(() => setAutoSaveStatus(""), 5000)
      }
    } catch (error) {
      console.error("保存データの読み込みエラー:", error)
    }
  }

  const saveDataToLocalStorage = () => {
    try {
      const dataToSave = {
        formData,
        activeStep,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.error("データの保存エラー:", error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
    setSuccess("")
  }

  const handleBigFiveChange = (trait: string, value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      bigFiveTraits: {
        ...prev.bigFiveTraits,
        [trait]: value[0],
      },
    }))
  }

  const generateGodImage = async () => {
    setImageGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/gods/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name || "神様",
          deity: formData.deity || "神格未設定",
          personality: formData.personality || "穏やかで知的",
          bigFiveTraits: formData.bigFiveTraits,
          mbtiType: formData.mbtiType || "INFJ",
          category: formData.category || "その他",
          colorTheme: formData.colorTheme,
          beliefs: formData.beliefs,
          special_skills: formData.special_skills,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "画像の生成に失敗しました")
      }

      setFormData((prev) => ({
        ...prev,
        generatedImage: result.imageUrl,
      }))

      setSuccess("神様の画像を生成しました！")
      setTimeout(() => setSuccess(""), 5000)
    } catch (error: any) {
      console.error("画像生成エラー:", error)
      setError(error.message)
    } finally {
      setImageGenerating(false)
    }
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name.trim()
      case 1:
        return formData.deity.trim() && formData.beliefs.trim() && formData.special_skills.trim()
      case 2:
        return formData.mbtiType !== "" && formData.personality.trim() && formData.speech_style.trim()
      case 3:
        return formData.relationship_with_humans.trim() && formData.relationship_with_followers.trim()
      case 4:
        return formData.colorTheme
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (userBalance < CREATION_COST) {
      setError(`神様作成には${CREATION_COST}賽銭が必要です。現在の残高: ${userBalance}賽銭`)
      return
    }

    setLoading(true)
    setError("")

    try {
      const godData = {
        name: formData.name.trim(),
        description: formData.beliefs.trim(),
        personality: formData.personality.trim(),
        mbtiType: formData.mbtiType,
        category: formData.category,
        colorTheme: formData.colorTheme,
        imageUrl: formData.generatedImage,
        deity: formData.deity.trim(),
        beliefs: formData.beliefs.trim(),
        specialSkills: formData.special_skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        speechStyle: formData.speech_style.trim(),
        actionStyle: formData.action_style.trim(),
        likes: formData.likes.trim(),
        dislikes: formData.dislikes.trim(),
        relationshipWithHumans: formData.relationship_with_humans.trim(),
        relationshipWithFollowers: formData.relationship_with_followers.trim(),
        limitations: formData.limitations.trim(),
        bigFiveTraits: formData.bigFiveTraits,
      }

      const response = await fetch("/api/gods/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(godData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "神様の作成に失敗しました")
      }

      setSuccess("神様が正常に作成されました！")
      localStorage.removeItem(STORAGE_KEY)

      setTimeout(() => {
        router.push(`/gods/${result.godId}`)
      }, 3000)
    } catch (error: any) {
      console.error("神様作成エラー:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedColorTheme = colorThemes.find((theme) => theme.value === formData.colorTheme)
  const selectedCategory = categories.find((cat) => cat.value === formData.category)

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // 基本情報
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">✨ 神様の基本情報を入力してください ✨</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">🏛️ 神様の名前</Label>
                <Input
                  id="name"
                  placeholder="例: 筋トレ神、週休2日制神"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">神様の名前を入力してください（必須）</p>
              </div>
            </div>
          </div>
        )

      case 1: // 神格・信念
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">⚡ 神格・信念・特技を入力してください</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deity">🏛️ 神格</Label>
                <Input
                  id="deity"
                  placeholder="例: 筋肉の神、労働の神"
                  value={formData.deity}
                  onChange={(e) => handleInputChange("deity", e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">この神様はどんな分野の神様ですか？（必須）</p>
              </div>
              <div>
                <Label htmlFor="beliefs">💫 信念</Label>
                <Textarea
                  id="beliefs"
                  placeholder="例: 毎日筋トレしないと神の力が弱まる、仕事も大事だが、休息も大事だ"
                  value={formData.beliefs}
                  onChange={(e) => handleInputChange("beliefs", e.target.value)}
                  className="mt-2"
                  rows={3}
                />
                <p className="text-sm text-gray-600 mt-1">この神様が持つ信念や価値観を教えてください（必須）</p>
              </div>
              <div>
                <Label htmlFor="special_skills">⭐ 特技・能力</Label>
                <Textarea
                  id="special_skills"
                  placeholder="例: 無限の筋力,休息の力（カンマ区切りで複数入力可能）"
                  value={formData.special_skills}
                  onChange={(e) => handleInputChange("special_skills", e.target.value)}
                  className="mt-2"
                  rows={3}
                />
                <p className="text-sm text-gray-600 mt-1">
                  この神様が持つ特技や能力をカンマ区切りで書いてください（必須）
                </p>
              </div>
            </div>
          </div>
        )

      case 2: // 性格・行動
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">😊 性格・行動スタイルを設定してください</h2>
            </div>

            {/* ビッグファイブ性格特性 */}
            <Card>
              <CardHeader>
                <CardTitle>📊 ビッグファイブ性格特性</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {bigFiveInfo.map((trait) => (
                  <div key={trait.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-semibold">{trait.label}</Label>
                      <Badge variant="outline">
                        {formData.bigFiveTraits[trait.key as keyof typeof formData.bigFiveTraits]}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{trait.description}</p>
                    <div className="px-2">
                      <Slider
                        value={[formData.bigFiveTraits[trait.key as keyof typeof formData.bigFiveTraits]]}
                        onValueChange={(value) => handleBigFiveChange(trait.key, value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{trait.lowLabel}</span>
                        <span>{trait.highLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* MBTI性格タイプ */}
            <Card>
              <CardHeader>
                <CardTitle>🧠 MBTI性格タイプを選択（必須）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mbtiTypes.map((type) => (
                    <Card
                      key={type.code}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.mbtiType === type.code ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}
                      onClick={() => handleInputChange("mbtiType", type.code)}
                    >
                      <CardContent className="p-3">
                        <div className="text-center">
                          <div className="font-bold text-lg">{type.code}</div>
                          <div className="text-sm text-gray-600">{type.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 追加情報 */}
            <Card>
              <CardHeader>
                <CardTitle>✨ 性格・口調情報（必須）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="personality">😊 性格・人格（必須）</Label>
                  <Textarea
                    id="personality"
                    placeholder="例: 明るく前向きで、いつも笑顔。困っている人を放っておけない優しい性格"
                    value={formData.personality}
                    onChange={(e) => handleInputChange("personality", e.target.value)}
                    className="mt-2"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="speech_style">🗣️ 口調や言葉遣い（必須）</Label>
                  <Textarea
                    id="speech_style"
                    placeholder="例: カジュアルでちょっとノリが良い、たまにダジャレを言う"
                    value={formData.speech_style}
                    onChange={(e) => handleInputChange("speech_style", e.target.value)}
                    className="mt-2"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="action_style">🎭 行動スタイル（任意）</Label>
                  <Textarea
                    id="action_style"
                    placeholder="例: いつも筋トレをしながら相談に乗る、休息の時間を大切にする"
                    value={formData.action_style}
                    onChange={(e) => handleInputChange("action_style", e.target.value)}
                    className="mt-2"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="likes">❤️ 好きなこと</Label>
                    <Input
                      id="likes"
                      placeholder="例: バーベルを持ち上げること"
                      value={formData.likes}
                      onChange={(e) => handleInputChange("likes", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dislikes">💔 嫌いなこと</Label>
                    <Input
                      id="dislikes"
                      placeholder="例: サボりすぎること"
                      value={formData.dislikes}
                      onChange={(e) => handleInputChange("dislikes", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3: // 人間関係
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">🤝 人間関係・役割を入力してください</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="relationship_with_humans">🌍 人間との関係</Label>
                <Textarea
                  id="relationship_with_humans"
                  placeholder="例: 筋トレを頑張っている人を応援、休み過ぎの人に休養を与える"
                  value={formData.relationship_with_humans}
                  onChange={(e) => handleInputChange("relationship_with_humans", e.target.value)}
                  className="mt-2"
                  rows={3}
                />
                <p className="text-sm text-gray-600 mt-1">一般的な人間に対してどのような関係を築きますか？（必須）</p>
              </div>
              <div>
                <Label htmlFor="relationship_with_followers">🙏 信者との関係</Label>
                <Textarea
                  id="relationship_with_followers"
                  placeholder="例: 毎日筋トレをする信者を応援、休息の重要性を説いてあげる"
                  value={formData.relationship_with_followers}
                  onChange={(e) => handleInputChange("relationship_with_followers", e.target.value)}
                  className="mt-2"
                  rows={3}
                />
                <p className="text-sm text-gray-600 mt-1">信者に対してどのような関係を築きますか？（必須）</p>
              </div>
              <div>
                <Label htmlFor="limitations">⚠️ 神としての制約や弱点（任意）</Label>
                <Textarea
                  id="limitations"
                  placeholder="例: サボりすぎの信者を完全には救えない"
                  value={formData.limitations}
                  onChange={(e) => handleInputChange("limitations", e.target.value)}
                  className="mt-2"
                  rows={3}
                />
                <p className="text-sm text-gray-600 mt-1">この神様にはどんな制約や弱点がありますか？（任意）</p>
              </div>

              {/* 専門分野選択 */}
              <div>
                <h3 className="text-lg font-semibold text-center mb-4">🎯 専門分野を選択してください</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <Card
                      key={category.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.category === category.value ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}
                      onClick={() => handleInputChange("category", category.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{category.emoji}</div>
                        <div className="font-semibold text-sm">{category.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4: // プレビュー
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">🎨 テーマカラーを選択してください</h2>
            </div>

            {/* カラーテーマ選択 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorThemes.map((theme) => (
                <Card
                  key={theme.value}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    formData.colorTheme === theme.value ? "ring-4 ring-purple-500" : ""
                  }`}
                  onClick={() => handleInputChange("colorTheme", theme.value)}
                >
                  <div
                    className="h-24 rounded-t-lg flex items-center justify-center text-white font-bold"
                    style={{ background: theme.gradient }}
                  >
                    <Avatar className="w-12 h-12 bg-white/20">
                      <AvatarFallback className="bg-transparent text-white">
                        {formData.name ? formData.name.charAt(0) : "神"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardContent className="p-3 text-center">
                    <div className="font-semibold">{theme.label}</div>
                    <div className="text-xs text-gray-600">{theme.description}</div>
                    {formData.colorTheme === theme.value && <Badge className="mt-2">選択中</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* 画像生成セクション */}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">🎨 神様の画像を生成</h3>

              <div className="flex justify-center">
                <Avatar className="w-32 h-32 border-4" style={{ borderColor: selectedColorTheme?.primary }}>
                  <AvatarImage src={formData.generatedImage || undefined} />
                  <AvatarFallback className="text-4xl bg-gray-200">
                    {formData.name ? formData.name.charAt(0) : "神"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {formData.generatedImage ? (
                <Button
                  variant="outline"
                  onClick={generateGodImage}
                  disabled={imageGenerating}
                  className="gap-2 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 ${imageGenerating ? "animate-spin" : ""}`} />
                  再生成
                </Button>
              ) : (
                <Button
                  onClick={generateGodImage}
                  disabled={imageGenerating || !formData.name}
                  className="gap-2"
                  style={{ background: selectedColorTheme?.gradient }}
                >
                  {imageGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {imageGenerating ? "生成中..." : "神様の画像を生成"}
                </Button>
              )}
              <p className="text-sm text-gray-600">入力された情報を基にAIが神様の画像を生成します</p>
            </div>

            <Separator />

            {/* プレビューカード */}
            <Card className="relative overflow-hidden" style={{ background: selectedColorTheme?.gradient }}>
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-white/30">
                    <AvatarImage src={formData.generatedImage || undefined} />
                    <AvatarFallback className="bg-white/20 text-white text-2xl">
                      {formData.name ? formData.name.charAt(0) : "神"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">{formData.name || "神様の名前"}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-white/20 text-white">
                        {selectedCategory?.emoji} {formData.category || "カテゴリー"}
                      </Badge>
                      <Badge className="bg-white/20 text-white">{formData.deity || "神格"}</Badge>
                      {formData.mbtiType && (
                        <Badge className="bg-white/15 text-white text-xs">{formData.mbtiType}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {formData.beliefs && (
                  <p className="text-white/90 italic">
                    {formData.beliefs.length > 100 ? formData.beliefs.substring(0, 100) + "..." : formData.beliefs}
                  </p>
                )}
              </CardContent>
            </Card>

            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>🎉 すべての設定が完了しました！次のステップで神様を開宗できます。</AlertDescription>
            </Alert>
          </div>
        )

      case 5: // 開宗
        return (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-purple-900">🎊 神様開宗の準備完了！</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">💰 コストと残高</h3>
              <div className="flex justify-center gap-4">
                <Badge variant="default" className="text-lg px-4 py-2">
                  作成コスト: {CREATION_COST}賽銭
                </Badge>
                <Badge variant={userBalance >= CREATION_COST ? "default" : "destructive"} className="text-lg px-4 py-2">
                  現在の残高: {userBalance}賽銭
                </Badge>
              </div>

              {userBalance >= CREATION_COST ? (
                <Alert>
                  <AlertDescription>✅ 残高は十分です！神様を開宗できます。</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    ❌ 残高が不足しています。管理者から恵を受け取るか、お布施で賽銭を獲得してください。
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {success && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">🎉 {success}</div>
                    <div>3秒後に神様のページに移動します...</div>
                    <Progress value={100} className="w-full" />
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={loading || userBalance < CREATION_COST}
              className="px-8 py-4 text-lg font-bold gap-2"
              style={{ background: selectedColorTheme?.gradient }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  神様を開宗中...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  {CREATION_COST}賽銭で神様を開宗する
                </>
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />

      {/* 自動保存ステータス */}
      {autoSaveStatus && (
        <div className="fixed top-20 right-4 z-50">
          <Alert className="shadow-lg">
            <Save className="h-4 w-4" />
            <AlertDescription>{autoSaveStatus}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
          <CardContent className="p-8 text-center relative overflow-hidden">
            <Crown className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl font-bold mb-2">✨ 神様開宗システム ✨</h1>
            <p className="text-xl opacity-90 mb-4">あなただけの神様を作成して、新しい宗教を始めましょう</p>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              <Coins className="h-4 w-4 mr-2" />
              現在の残高: {userBalance}賽銭
            </Badge>
          </CardContent>
        </Card>

        {/* ステッパー */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = activeStep >= index
                const isCurrent = activeStep === index

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive ? "bg-purple-600 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                      } ${isCurrent ? "ring-4 ring-purple-200" : ""}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? "text-purple-600" : "text-gray-500"}`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute h-0.5 w-16 mt-6 ${isActive ? "bg-purple-600" : "bg-gray-200"}`}
                        style={{ left: `${(index + 1) * (100 / steps.length)}%`, transform: "translateX(-50%)" }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* メインコンテンツ */}
        <Card className="mb-8">
          <CardContent className="p-8 min-h-[600px]">{renderStepContent(activeStep)}</CardContent>
        </Card>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={activeStep === 0} className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>

          {activeStep < steps.length - 1 && (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
              className="gap-2"
              style={{ background: selectedColorTheme?.gradient }}
            >
              次へ
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
