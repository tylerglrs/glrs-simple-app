import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  logAudit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  User,
  Target,
  Award,
  Phone,
  Mail,
  Calendar,
  Clock,
  Edit,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  MessageSquare,
  AlertTriangle,
  LogIn,
  BookOpen,
  Trophy,
  Activity,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Zap,
  Moon,
  TrendingUp,
  TrendingDown,
  Flag,
  Check,
  Tag,
  ClipboardCheck,
  Sunrise,
  Send,
  Eye,
  EyeOff,
  X,
  MessageCircle,
  MapPin,
  Map as MapIcon,
  Globe,
  Video,
  UserPlus,
  Search,
  ExternalLink,
  Circle,
  CheckSquare,
  Star,
  Crown,
  Sparkles,
  DollarSign,
  Wallet,
  PieChart,
  Link,
  Upload,
  Folder,
  FileCheck,
  Info,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatDate, getInitials } from "@/lib/utils"
import {
  PIRUser,
  Coach,
  Activity as ActivityTypeInterface,
  EmergencyContact,
  CheckIn,
  Goal,
  Assignment,
  CoachNote,
  Gratitude,
  Reflection,
  Breakthrough,
  ChartDataPoint,
  TrendData,
  Pattern,
  ObjectiveWithGoal,
  Message,
  DailyPost,
  PostComment,
  SavedMeeting,
  GuideNote,
  ResourceProgress,
  Resource,
  AssignedResource,
  SavingsItem,
  SavingsGoal,
  Document as DocumentType,
  TABS,
} from "./types"

const CURRENT_TENANT = "full-service"

// Calculate sobriety days from date
function calculateSobrietyDays(sobrietyDate?: string): number {
  if (!sobrietyDate) return 0
  const start = new Date(sobrietyDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// Format relative time
function formatTimeAgo(date?: Date): string {
  if (!date) return "Unknown"
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date, "short")
}

// Activity icon and color mapping
function getActivityConfig(type: string) {
  const configs: Record<string, { icon: typeof CheckCircle; color: string; bgClass: string }> = {
    check_in: { icon: CheckCircle, color: "text-emerald-600", bgClass: "bg-emerald-100" },
    assignment_completed: { icon: Trophy, color: "text-amber-600", bgClass: "bg-amber-100" },
    goal_completed: { icon: Target, color: "text-blue-600", bgClass: "bg-blue-100" },
    message_sent: { icon: MessageSquare, color: "text-purple-600", bgClass: "bg-purple-100" },
    message_received: { icon: MessageSquare, color: "text-indigo-600", bgClass: "bg-indigo-100" },
    sos_triggered: { icon: AlertTriangle, color: "text-red-600", bgClass: "bg-red-100" },
    login: { icon: LogIn, color: "text-gray-600", bgClass: "bg-gray-100" },
    profile_updated: { icon: User, color: "text-teal-600", bgClass: "bg-teal-100" },
    resource_viewed: { icon: BookOpen, color: "text-cyan-600", bgClass: "bg-cyan-100" },
    milestone_achieved: { icon: Award, color: "text-orange-600", bgClass: "bg-orange-100" },
    meeting_attended: { icon: Calendar, color: "text-violet-600", bgClass: "bg-violet-100" },
    group_joined: { icon: User, color: "text-pink-600", bgClass: "bg-pink-100" },
    reflection_added: { icon: FileText, color: "text-slate-600", bgClass: "bg-slate-100" },
    habit_completed: { icon: CheckCircle, color: "text-lime-600", bgClass: "bg-lime-100" },
  }
  return configs[type] || { icon: Activity, color: "text-gray-500", bgClass: "bg-gray-100" }
}

// ==========================================
// OVERVIEW TAB
// ==========================================
function OverviewTab({
  pirData,
  coaches,
  onSave,
  onChangeCoach,
  initialEditMode = false,
}: {
  pirData: PIRUser
  coaches: Coach[]
  onSave: (data: Partial<PIRUser>) => Promise<void>
  onChangeCoach: (coachId: string) => Promise<void>
  initialEditMode?: boolean
}) {
  const [isEditing, setIsEditing] = useState(initialEditMode)
  const [editData, setEditData] = useState<Partial<PIRUser>>({})
  const [showCoachModal, setShowCoachModal] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (pirData) {
      setEditData({
        firstName: pirData.firstName,
        lastName: pirData.lastName,
        phone: pirData.phone,
        dateOfBirth: pirData.dateOfBirth,
        sobrietyDate: pirData.sobrietyDate,
        substance: pirData.substance,
        dailyCost: pirData.dailyCost,
        emergencyContacts: pirData.emergencyContacts || [],
      })
    }
  }, [pirData])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(editData)
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCoachChange = async () => {
    if (!selectedCoach) return
    setSaving(true)
    try {
      await onChangeCoach(selectedCoach)
      setShowCoachModal(false)
      setSelectedCoach("")
    } catch (error) {
      console.error("Error changing coach:", error)
      toast.error("Failed to change coach")
    } finally {
      setSaving(false)
    }
  }

  const addEmergencyContact = () => {
    setEditData({
      ...editData,
      emergencyContacts: [
        ...(editData.emergencyContacts || []),
        { name: "", relationship: "", phone: "" },
      ],
    })
  }

  const removeEmergencyContact = (index: number) => {
    setEditData({
      ...editData,
      emergencyContacts: (editData.emergencyContacts || []).filter((_, i) => i !== index),
    })
  }

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const contacts = [...(editData.emergencyContacts || [])]
    contacts[index] = { ...contacts[index], [field]: value }
    setEditData({ ...editData, emergencyContacts: contacts })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={saving}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">First Name</Label>
              {isEditing ? (
                <Input
                  value={editData.firstName || ""}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                />
              ) : (
                <p className="font-medium">{pirData.firstName || "-"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Last Name</Label>
              {isEditing ? (
                <Input
                  value={editData.lastName || ""}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                />
              ) : (
                <p className="font-medium">{pirData.lastName || "-"}</p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="flex items-center gap-2 font-medium">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {pirData.email}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone</Label>
            {isEditing ? (
              <Input
                value={editData.phone || ""}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            ) : (
              <p className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {pirData.phone || "-"}
              </p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Date of Birth</Label>
            {isEditing ? (
              <Input
                type="date"
                value={editData.dateOfBirth || ""}
                onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
              />
            ) : (
              <p className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {pirData.dateOfBirth || "-"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            Recovery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Sobriety Date</Label>
            {isEditing ? (
              <Input
                type="date"
                value={editData.sobrietyDate || ""}
                onChange={(e) => setEditData({ ...editData, sobrietyDate: e.target.value })}
              />
            ) : (
              <p className="font-medium">{pirData.sobrietyDate || "-"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Days Sober</Label>
            <p className="text-2xl font-bold text-primary">{pirData.sobrietyDays || 0}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Substance</Label>
            {isEditing ? (
              <Input
                value={editData.substance || ""}
                onChange={(e) => setEditData({ ...editData, substance: e.target.value })}
              />
            ) : (
              <p className="font-medium">{pirData.substance || "-"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Daily Cost Saved</Label>
            {isEditing ? (
              <Input
                type="number"
                value={editData.dailyCost || 20}
                onChange={(e) => setEditData({ ...editData, dailyCost: Number(e.target.value) })}
              />
            ) : (
              <p className="font-medium">${pirData.dailyCost || 20}/day</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Total Money Saved</Label>
            <p className="text-xl font-bold text-emerald-600">
              ${((pirData.sobrietyDays || 0) * (pirData.dailyCost || 20)).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coach Assignment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Assigned Coach
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowCoachModal(true)}>
            Change Coach
          </Button>
        </CardHeader>
        <CardContent>
          {pirData.assignedCoach ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(pirData.assignedCoachName || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{pirData.assignedCoachName}</p>
                <p className="text-sm text-muted-foreground">{pirData.assignedCoachEmail}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No coach assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary" />
            Emergency Contacts
          </CardTitle>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={addEmergencyContact}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {(isEditing ? editData.emergencyContacts : pirData.emergencyContacts)?.length ? (
            <div className="space-y-4">
              {(isEditing ? editData.emergencyContacts : pirData.emergencyContacts)?.map(
                (contact, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Name"
                            value={contact.name}
                            onChange={(e) => updateEmergencyContact(index, "name", e.target.value)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 text-red-500"
                            onClick={() => removeEmergencyContact(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Relationship"
                          value={contact.relationship}
                          onChange={(e) =>
                            updateEmergencyContact(index, "relationship", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Phone"
                          value={contact.phone}
                          onChange={(e) => updateEmergencyContact(index, "phone", e.target.value)}
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No emergency contacts</p>
          )}
        </CardContent>
      </Card>

      {/* Coach Change Modal */}
      <Dialog open={showCoachModal} onOpenChange={setShowCoachModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Assigned Coach</DialogTitle>
            <DialogDescription>Select a new coach for this PIR</DialogDescription>
          </DialogHeader>
          <Select value={selectedCoach} onValueChange={setSelectedCoach}>
            <SelectTrigger>
              <SelectValue placeholder="Select a coach" />
            </SelectTrigger>
            <SelectContent>
              {coaches.map((coach) => (
                <SelectItem key={coach.id} value={coach.id}>
                  {coach.displayName || `${coach.firstName} ${coach.lastName}`} ({coach.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCoachModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCoachChange} disabled={!selectedCoach || saving}>
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==========================================
// WELLNESS TAB
// ==========================================
function WellnessTab({
  pirId,
  checkIns,
  checkInsLoading,
}: {
  pirId: string
  checkIns: CheckIn[]
  checkInsLoading: boolean
}) {
  const { adminUser } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState("charts")
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([])
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<CoachNote | null>(null)
  const [noteText, setNoteText] = useState("")
  const [noteCategory, setNoteCategory] = useState<CoachNote["category"]>("general")
  const [saving, setSaving] = useState(false)

  // Load coach notes
  useEffect(() => {
    const loadCoachNotes = async () => {
      if (!pirId) return
      try {
        setLoadingNotes(true)
        const snap = await getDocs(
          query(collection(db, "coachNotes"), where("pirId", "==", pirId), orderBy("createdAt", "desc"))
        )
        const notes: CoachNote[] = []
        snap.forEach((docSnap) => {
          const data = docSnap.data()
          notes.push({
            id: docSnap.id,
            pirId: data.pirId,
            coachId: data.coachId,
            coachName: data.coachName,
            text: data.text,
            category: data.category || "general",
            createdAt: data.createdAt?.toDate?.(),
            updatedAt: data.updatedAt?.toDate?.(),
          })
        })
        setCoachNotes(notes)
      } catch (error) {
        console.error("Error loading coach notes:", error)
      } finally {
        setLoadingNotes(false)
      }
    }
    loadCoachNotes()
  }, [pirId])

  // Calculate chart data from check-ins (last 30 days)
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!checkIns.length) return []

    const last30Days: ChartDataPoint[] = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      const dayCheckIns = checkIns.filter((c) => {
        if (!c.createdAt) return false
        const checkInDate = new Date(c.createdAt)
        return (
          checkInDate.getDate() === date.getDate() &&
          checkInDate.getMonth() === date.getMonth() &&
          checkInDate.getFullYear() === date.getFullYear()
        )
      })

      if (dayCheckIns.length > 0) {
        const avgMood =
          dayCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / dayCheckIns.length
        const avgCravings =
          dayCheckIns.reduce((sum, c) => sum + (c.cravings || 0), 0) / dayCheckIns.length
        const avgAnxiety =
          dayCheckIns.reduce((sum, c) => sum + (c.anxiety || 0), 0) / dayCheckIns.length
        const avgSleep =
          dayCheckIns.reduce((sum, c) => sum + (c.sleep || 0), 0) / dayCheckIns.length

        last30Days.push({
          date: dateStr,
          mood: Math.round(avgMood * 10) / 10,
          cravings: Math.round(avgCravings * 10) / 10,
          anxiety: Math.round(avgAnxiety * 10) / 10,
          sleep: Math.round(avgSleep * 10) / 10,
        })
      } else {
        last30Days.push({
          date: dateStr,
          mood: null,
          cravings: null,
          anxiety: null,
          sleep: null,
        })
      }
    }
    return last30Days
  }, [checkIns])

  // Calculate trends
  const trends = useMemo<Record<string, TrendData> | null>(() => {
    if (!chartData.length) return null

    const metrics = ["mood", "cravings", "anxiety", "sleep"] as const
    const result: Record<string, TrendData> = {}

    metrics.forEach((metric) => {
      const data = chartData
        .map((d) => d[metric])
        .filter((v): v is number => v !== null && v !== undefined)

      if (data.length === 0) {
        result[metric] = { avg30: "0", avg7: "0", trend: "stable", change: "0" }
        return
      }

      const avg30 = data.reduce((a, b) => a + b, 0) / data.length
      const last7 = data.slice(-7)
      const avg7 = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : avg30

      const change = avg7 - avg30
      let trend: "up" | "down" | "stable" = "stable"
      if (Math.abs(change) > 0.5) {
        trend = change > 0 ? "up" : "down"
      }

      result[metric] = {
        avg30: avg30.toFixed(1),
        avg7: avg7.toFixed(1),
        trend,
        change: change.toFixed(1),
      }
    })

    return result
  }, [chartData])

  // Detect patterns
  const patterns = useMemo<Pattern[]>(() => {
    if (!trends) return []

    const detected: Pattern[] = []

    // High craving average
    if (parseFloat(trends.cravings.avg7) > 5) {
      detected.push({
        type: "warning",
        title: "Elevated Craving Levels",
        message: `7-day average craving is ${trends.cravings.avg7}/10. Consider additional support or coping strategies.`,
        metric: "craving",
        severity: "high",
      })
    }

    // Low mood
    if (parseFloat(trends.mood.avg7) < 4) {
      detected.push({
        type: "warning",
        title: "Low Mood Detected",
        message: `7-day average mood is ${trends.mood.avg7}/10. May indicate depression or struggles.`,
        metric: "mood",
        severity: "high",
      })
    }

    // Poor sleep
    if (parseFloat(trends.sleep.avg7) < 4) {
      detected.push({
        type: "warning",
        title: "Poor Sleep Quality",
        message: `7-day average sleep quality is ${trends.sleep.avg7}/10. Sleep issues can impact recovery.`,
        metric: "sleep",
        severity: "medium",
      })
    }

    // Rising anxiety
    if (trends.anxiety.trend === "up" && parseFloat(trends.anxiety.change) > 1) {
      detected.push({
        type: "warning",
        title: "Rising Anxiety",
        message: `Anxiety increased by ${Math.abs(parseFloat(trends.anxiety.change))} points over the week. Monitor closely.`,
        metric: "anxiety",
        severity: "medium",
      })
    }

    // Positive patterns
    if (parseFloat(trends.mood.avg7) >= 7) {
      detected.push({
        type: "positive",
        title: "Strong Mood",
        message: `7-day average mood is ${trends.mood.avg7}/10. Excellent progress!`,
        metric: "mood",
        severity: "positive",
      })
    }

    if (parseFloat(trends.cravings.avg7) < 3) {
      detected.push({
        type: "positive",
        title: "Low Cravings",
        message: `7-day average craving is only ${trends.cravings.avg7}/10. Great control!`,
        metric: "craving",
        severity: "positive",
      })
    }

    return detected
  }, [trends])

  // Coach Notes CRUD
  const handleSaveNote = async () => {
    if (!noteText.trim() || !adminUser) return
    try {
      setSaving(true)
      if (editingNote) {
        await updateDoc(doc(db, "coachNotes", editingNote.id), {
          text: noteText.trim(),
          category: noteCategory,
          updatedAt: serverTimestamp(),
        })
        setCoachNotes(
          coachNotes.map((n) =>
            n.id === editingNote.id ? { ...n, text: noteText.trim(), category: noteCategory } : n
          )
        )
        toast.success("Note updated")
      } else {
        const docRef = await addDoc(collection(db, "coachNotes"), {
          pirId,
          text: noteText.trim(),
          category: noteCategory,
          coachId: adminUser.id,
          coachName: adminUser.displayName || adminUser.email,
          createdAt: serverTimestamp(),
        })
        setCoachNotes([
          {
            id: docRef.id,
            pirId,
            text: noteText.trim(),
            category: noteCategory,
            coachId: adminUser.id,
            coachName: adminUser.displayName || adminUser.email,
            createdAt: new Date(),
          },
          ...coachNotes,
        ])
        toast.success("Note added")
      }
      setNoteText("")
      setNoteCategory("general")
      setShowAddNote(false)
      setEditingNote(null)
    } catch (error) {
      console.error("Error saving note:", error)
      toast.error("Failed to save note")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    try {
      await deleteDoc(doc(db, "coachNotes", noteId))
      setCoachNotes(coachNotes.filter((n) => n.id !== noteId))
      toast.success("Note deleted")
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note")
    }
  }

  const noteCategories = [
    { value: "general", label: "General", color: "bg-gray-100 text-gray-700" },
    { value: "progress", label: "Progress", color: "bg-emerald-100 text-emerald-700" },
    { value: "concern", label: "Concern", color: "bg-orange-100 text-orange-700" },
    { value: "goal", label: "Goal Update", color: "bg-blue-100 text-blue-700" },
    { value: "session", label: "Session Note", color: "bg-purple-100 text-purple-700" },
  ]

  const chartConfig = [
    { key: "mood", label: "Mood", color: "#069494", icon: Heart },
    { key: "cravings", label: "Cravings", color: "#f97316", icon: Zap },
    { key: "anxiety", label: "Anxiety", color: "#8b5cf6", icon: Activity },
    { key: "sleep", label: "Sleep", color: "#3b82f6", icon: Moon },
  ]

  if (checkInsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="charts" className="gap-2">
            <Activity className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Coach Notes
          </TabsTrigger>
        </TabsList>

        {/* Charts Sub-tab */}
        <TabsContent value="charts" className="mt-6">
          {chartData.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {chartConfig.map((config) => (
                <Card key={config.key}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <config.icon className="h-5 w-5" style={{ color: config.color }} />
                      {config.label}
                    </CardTitle>
                    {trends && (
                      <Badge variant="secondary" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                        Avg: {trends[config.key].avg7}/10
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey={config.key}
                            stroke={config.color}
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">No check-in data available for the past 30 days.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Sub-tab */}
        <TabsContent value="trends" className="mt-6">
          {trends ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[
                { key: "mood", label: "Mood", icon: Heart, color: "#069494", goodTrend: "up" },
                { key: "cravings", label: "Craving", icon: Zap, color: "#f97316", goodTrend: "down" },
                { key: "anxiety", label: "Anxiety", icon: Activity, color: "#8b5cf6", goodTrend: "down" },
                { key: "sleep", label: "Sleep", icon: Moon, color: "#3b82f6", goodTrend: "up" },
              ].map((metric) => {
                const data = trends[metric.key]
                const isGood =
                  (metric.goodTrend === "up" && data.trend === "up") ||
                  (metric.goodTrend === "down" && data.trend === "down") ||
                  data.trend === "stable"
                const trendColor = data.trend === "stable" ? "#666" : isGood ? "#10b981" : "#ef4444"

                return (
                  <Card key={metric.key}>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${metric.color}15` }}
                        >
                          <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                        </div>
                        <div>
                          <p className="font-semibold">{metric.label}</p>
                          <p className="text-sm text-muted-foreground">30-day trend analysis</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{data.avg7}</p>
                          <p className="text-xs text-muted-foreground">7-Day Avg</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-muted-foreground">{data.avg30}</p>
                          <p className="text-xs text-muted-foreground">30-Day Avg</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1" style={{ color: trendColor }}>
                            {data.trend === "up" && <TrendingUp className="h-5 w-5" />}
                            {data.trend === "down" && <TrendingDown className="h-5 w-5" />}
                            <span className="text-2xl font-bold">
                              {data.trend === "stable" ? "—" : `${parseFloat(data.change) > 0 ? "+" : ""}${data.change}`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Change</p>
                        </div>
                      </div>
                      <div
                        className="mt-4 rounded-lg p-3 text-center text-sm font-medium"
                        style={{
                          backgroundColor: isGood ? "#10b98115" : "#ef444415",
                          color: isGood ? "#10b981" : "#ef4444",
                        }}
                      >
                        {data.trend === "stable"
                          ? "Stable - no significant change"
                          : isGood
                          ? "Positive trend - keep it up!"
                          : "Needs attention - review with PIR"}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Not enough data for trend analysis.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Patterns Sub-tab */}
        <TabsContent value="patterns" className="mt-6">
          {patterns.length > 0 ? (
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <Card
                  key={index}
                  className="border-l-4"
                  style={{
                    borderLeftColor:
                      pattern.type === "positive" ? "#10b981" : pattern.severity === "high" ? "#ef4444" : "#f97316",
                  }}
                >
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor:
                          pattern.type === "positive"
                            ? "#10b98115"
                            : pattern.severity === "high"
                            ? "#ef444415"
                            : "#f9731615",
                      }}
                    >
                      {pattern.type === "positive" ? (
                        <Check
                          className="h-6 w-6"
                          style={{ color: "#10b981" }}
                        />
                      ) : (
                        <AlertTriangle
                          className="h-6 w-6"
                          style={{ color: pattern.severity === "high" ? "#ef4444" : "#f97316" }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">{pattern.title}</h3>
                        <Badge
                          variant="secondary"
                          className={
                            pattern.type === "positive"
                              ? "bg-emerald-100 text-emerald-700"
                              : pattern.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }
                        >
                          {pattern.type === "positive" ? "Positive" : pattern.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{pattern.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="h-12 w-12 text-emerald-500" />
                <h3 className="mt-4 font-semibold">No Concerning Patterns</h3>
                <p className="text-muted-foreground">All wellness metrics are within healthy ranges.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Coach Notes Sub-tab */}
        <TabsContent value="notes" className="mt-6">
          <div className="mb-4">
            <Button
              onClick={() => {
                setShowAddNote(true)
                setEditingNote(null)
                setNoteText("")
                setNoteCategory("general")
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Coach Note
            </Button>
          </div>

          {/* Add/Edit Note Form */}
          {(showAddNote || editingNote) && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h4 className="mb-4 font-semibold">{editingNote ? "Edit Note" : "New Coach Note"}</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={noteCategory} onValueChange={(v) => setNoteCategory(v as CoachNote["category"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {noteCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Note</Label>
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter your note about this PIR..."
                      className="min-h-32"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddNote(false)
                        setEditingNote(null)
                        setNoteText("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNote} disabled={saving || !noteText.trim()}>
                      {saving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes List */}
          {loadingNotes ? (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : coachNotes.length > 0 ? (
            <div className="space-y-4">
              {coachNotes.map((note) => {
                const category = noteCategories.find((c) => c.value === note.category) || noteCategories[0]
                return (
                  <Card key={note.id}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className={category.color}>
                            {category.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {note.createdAt?.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingNote(note)
                              setNoteText(note.text)
                              setNoteCategory(note.category)
                              setShowAddNote(false)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap">{note.text}</p>
                      {note.coachName && (
                        <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                          Added by: {note.coachName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 font-semibold">No Coach Notes Yet</h3>
                <p className="text-muted-foreground">Add your first note to track observations and progress.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==========================================
// TASKS TAB
// ==========================================
function TasksTab({
  pirId,
  assignments,
  setAssignments,
  goals,
  setGoals,
  objectives,
  setObjectives,
  checkIns,
  gratitudes,
  reflections,
  breakthroughs,
  loading,
}: {
  pirId: string
  assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
  goals: Goal[]
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
  objectives: ObjectiveWithGoal[]
  setObjectives: React.Dispatch<React.SetStateAction<ObjectiveWithGoal[]>>
  checkIns: CheckIn[]
  gratitudes: Gratitude[]
  reflections: Reflection[]
  breakthroughs: Breakthrough[]
  loading: boolean
}) {
  const { adminUser } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState("assignments")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [modalType, setModalType] = useState<"assignment" | "goal" | "objective">("assignment")
  const [editingItem, setEditingItem] = useState<Assignment | Goal | ObjectiveWithGoal | null>(null)
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({})
  const [expandedObjectives, setExpandedObjectives] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as "pending" | "in_progress" | "completed",
    dueDate: "",
    goalId: "",
    objectiveId: "",
  })

  const categories = [
    { value: "general", label: "General" },
    { value: "wellness", label: "Wellness" },
    { value: "therapy", label: "Therapy" },
    { value: "medication", label: "Medication" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "social", label: "Social" },
    { value: "financial", label: "Financial" },
    { value: "vocational", label: "Vocational" },
  ]

  const priorities = [
    { value: "low", label: "Low", color: "bg-emerald-100 text-emerald-700" },
    { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700" },
    { value: "high", label: "High", color: "bg-red-100 text-red-700" },
  ]

  const statuses = [
    { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700" },
    { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
    { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-700" },
    { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-700" },
  ]

  // Enrich assignments with overdue status
  const enrichedAssignments = useMemo(() => {
    return assignments.map((a) => {
      if (a.status !== "completed" && a.dueDate) {
        const dueDate = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate)
        if (dueDate < new Date()) {
          return { ...a, status: "overdue" as const }
        }
      }
      return a
    })
  }, [assignments])

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    if (statusFilter === "all") return enrichedAssignments
    return enrichedAssignments.filter((a) => a.status === statusFilter)
  }, [enrichedAssignments, statusFilter])

  // Stats
  const stats = useMemo(() => ({
    total: enrichedAssignments.length,
    pending: enrichedAssignments.filter((a) => a.status === "pending").length,
    inProgress: enrichedAssignments.filter((a) => a.status === "in_progress").length,
    completed: enrichedAssignments.filter((a) => a.status === "completed").length,
    overdue: enrichedAssignments.filter((a) => a.status === "overdue").length,
  }), [enrichedAssignments])

  // Open modal for create
  const openCreateModal = (type: "assignment" | "goal" | "objective", goalId = "", objectiveId = "") => {
    setModalMode("create")
    setModalType(type)
    setEditingItem(null)
    setFormData({
      title: "",
      description: "",
      category: "general",
      priority: "medium",
      status: "pending",
      dueDate: "",
      goalId,
      objectiveId,
    })
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (item: Assignment | Goal | ObjectiveWithGoal, type: "assignment" | "goal" | "objective") => {
    setModalMode("edit")
    setModalType(type)
    setEditingItem(item)

    // Get status based on item type
    let statusValue = "pending"
    if (type === "goal" && "status" in item) {
      statusValue = (item as Goal).status === "active" ? "pending" :
                    (item as Goal).status === "completed" ? "completed" : "pending"
    } else if (type === "assignment" && "status" in item) {
      statusValue = (item as Assignment).status
    } else if (type === "objective" && (item as ObjectiveWithGoal).completed) {
      statusValue = "completed"
    }

    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: (item as Assignment).type || "general",
      priority: (item as Assignment).priority || "medium",
      status: statusValue as "pending" | "in_progress" | "completed",
      dueDate: (item as Assignment).dueDate
        ? new Date((item as Assignment).dueDate!).toISOString().split("T")[0]
        : "",
      goalId: (item as ObjectiveWithGoal).goalId || "",
      objectiveId: "",
    })
    setShowModal(true)
  }

  // Handle create/update
  const handleSave = async () => {
    if (!formData.title.trim() || !adminUser) return

    try {
      setSaving(true)
      const collectionName =
        modalType === "goal" ? "goals" : modalType === "objective" ? "objectives" : "assignments"

      if (modalMode === "edit" && editingItem) {
        await updateDoc(doc(db, collectionName, editingItem.id), {
          title: formData.title.trim(),
          description: formData.description.trim(),
          ...(modalType === "assignment" && {
            type: formData.category,
            priority: formData.priority,
            status: formData.status,
            dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          }),
          updatedAt: serverTimestamp(),
        })

        if (modalType === "assignment") {
          setAssignments(
            assignments.map((a) =>
              a.id === editingItem.id
                ? {
                    ...a,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    type: formData.category,
                    priority: formData.priority,
                    status: formData.status,
                    dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                  }
                : a
            )
          )
        } else if (modalType === "goal") {
          setGoals(
            goals.map((g) =>
              g.id === editingItem.id
                ? { ...g, title: formData.title.trim(), description: formData.description.trim() }
                : g
            )
          )
        } else {
          setObjectives(
            objectives.map((o) =>
              o.id === editingItem.id
                ? { ...o, title: formData.title.trim(), description: formData.description.trim() }
                : o
            )
          )
        }
        toast.success(`${modalType} updated`)
      } else {
        const docRef = await addDoc(collection(db, collectionName), {
          title: formData.title.trim(),
          description: formData.description.trim(),
          pirId,
          ...(modalType === "assignment" && {
            coachId: adminUser.id,
            type: formData.category,
            priority: formData.priority,
            status: formData.status,
            dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          }),
          ...(modalType === "objective" && { goalId: formData.goalId }),
          createdAt: serverTimestamp(),
          tenantId: CURRENT_TENANT,
        })

        const newItem = {
          id: docRef.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          pirId,
          createdAt: new Date(),
        }

        if (modalType === "assignment") {
          setAssignments([
            {
              ...newItem,
              coachId: adminUser.id,
              type: formData.category,
              priority: formData.priority,
              status: formData.status,
              dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
            } as Assignment,
            ...assignments,
          ])
        } else if (modalType === "goal") {
          setGoals([{ ...newItem, status: "active" } as Goal, ...goals])
        } else {
          setObjectives([
            { ...newItem, goalId: formData.goalId, completed: false } as ObjectiveWithGoal,
            ...objectives,
          ])
        }
        toast.success(`${modalType} created`)
      }
      setShowModal(false)
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (item: Assignment | Goal | ObjectiveWithGoal, type: "assignment" | "goal" | "objective") => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    try {
      const collectionName = type === "goal" ? "goals" : type === "objective" ? "objectives" : "assignments"
      await deleteDoc(doc(db, collectionName, item.id))

      if (type === "assignment") {
        setAssignments(assignments.filter((a) => a.id !== item.id))
      } else if (type === "goal") {
        setGoals(goals.filter((g) => g.id !== item.id))
      } else {
        setObjectives(objectives.filter((o) => o.id !== item.id))
      }
      toast.success(`${type} deleted`)
    } catch (error) {
      console.error("Error deleting:", error)
      toast.error("Failed to delete")
    }
  }

  // Handle status change
  const handleStatusChange = async (assignment: Assignment, newStatus: Assignment["status"]) => {
    try {
      await updateDoc(doc(db, "assignments", assignment.id), {
        status: newStatus,
        completedAt: newStatus === "completed" ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      })
      setAssignments(assignments.map((a) => (a.id === assignment.id ? { ...a, status: newStatus } : a)))
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  // Get objectives for a goal
  const getObjectivesForGoal = (goalId: string) => objectives.filter((o) => o.goalId === goalId)

  // Get assignments for an objective
  const getAssignmentsForObjective = (objectiveId: string) =>
    enrichedAssignments.filter((a) => (a as Assignment & { objectiveId?: string }).objectiveId === objectiveId)

  const subTabs = [
    { id: "assignments", label: "Assignments", icon: ClipboardCheck, count: stats.total },
    { id: "goals", label: "Golden Thread", icon: Target, count: goals.length },
    { id: "checkins", label: "Check-ins", icon: CheckCircle, count: checkIns.length },
    {
      id: "reflections",
      label: "Reflections",
      icon: Heart,
      count: gratitudes.length + reflections.length,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="w-full justify-start">
          {subTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <Badge variant="secondary" className="ml-1">
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Assignments Sub-tab */}
        <TabsContent value="assignments" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All", count: stats.total },
                { id: "pending", label: "Pending", count: stats.pending },
                { id: "in_progress", label: "In Progress", count: stats.inProgress },
                { id: "completed", label: "Completed", count: stats.completed },
                { id: "overdue", label: "Overdue", count: stats.overdue },
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={statusFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter.id)}
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
            <Button onClick={() => openCreateModal("assignment")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>

          {/* Assignments List */}
          <Card>
            <CardContent className="p-0">
              {filteredAssignments.length > 0 ? (
                <div className="divide-y">
                  {filteredAssignments.map((assignment) => {
                    const statusInfo = statuses.find((s) => s.value === assignment.status) || statuses[0]
                    const priorityInfo = priorities.find((p) => p.value === assignment.priority) || priorities[1]
                    return (
                      <div key={assignment.id} className="flex items-start gap-4 p-4">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              assignment,
                              assignment.status === "completed" ? "pending" : "completed"
                            )
                          }
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                            assignment.status === "completed"
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {assignment.status === "completed" && <Check className="h-4 w-4" />}
                        </button>
                        <div className="flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`font-medium ${
                                assignment.status === "completed" ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              {assignment.title}
                            </span>
                            <Badge variant="secondary" className={priorityInfo.color}>
                              {priorityInfo.label}
                            </Badge>
                            <Badge variant="secondary" className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          {assignment.description && (
                            <p className="mb-2 text-sm text-muted-foreground">{assignment.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            {assignment.type && (
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {categories.find((c) => c.value === assignment.type)?.label || assignment.type}
                              </span>
                            )}
                            {assignment.dueDate && (
                              <span
                                className={`flex items-center gap-1 ${
                                  assignment.status === "overdue" ? "text-red-500" : ""
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                Due: {formatDate(assignment.dueDate, "short")}
                              </span>
                            )}
                            {assignment.createdAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(assignment.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(assignment, "assignment")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(assignment, "assignment")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Inbox className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">No assignments found</p>
                  <Button className="mt-4" onClick={() => openCreateModal("assignment")}>
                    Create First Assignment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Golden Thread Sub-tab */}
        <TabsContent value="goals" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Golden Thread Hierarchy</h3>
              <p className="text-sm text-muted-foreground">Goals → Objectives → Assignments</p>
            </div>
            <Button onClick={() => openCreateModal("goal")} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {goals.length > 0 ? (
                <div className="divide-y">
                  {goals.map((goal) => {
                    const goalObjectives = getObjectivesForGoal(goal.id)
                    const isExpanded = expandedGoals[goal.id] !== false

                    return (
                      <div key={goal.id}>
                        {/* Goal Header */}
                        <div
                          className="flex cursor-pointer items-center gap-3 bg-muted/30 p-4"
                          onClick={() => setExpandedGoals({ ...expandedGoals, [goal.id]: !isExpanded })}
                        >
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{goal.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {goalObjectives.length} objective{goalObjectives.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCreateModal("objective", goal.id)}
                            >
                              + Objective
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(goal, "goal")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDelete(goal, "goal")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Objectives */}
                        {isExpanded &&
                          goalObjectives.map((objective) => {
                            const objAssignments = getAssignmentsForObjective(objective.id)
                            const isObjExpanded = expandedObjectives[objective.id] !== false

                            return (
                              <div key={objective.id} className="ml-10">
                                {/* Objective Header */}
                                <div
                                  className="flex cursor-pointer items-center gap-3 border-t p-4"
                                  onClick={() =>
                                    setExpandedObjectives({
                                      ...expandedObjectives,
                                      [objective.id]: !isObjExpanded,
                                    })
                                  }
                                >
                                  <Button variant="ghost" size="icon" className="h-5 w-5">
                                    {isObjExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                                    <Flag className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{objective.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {objAssignments.length} assignment{objAssignments.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => openCreateModal("assignment", goal.id, objective.id)}
                                    >
                                      + Task
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEditModal(objective, "objective")}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => handleDelete(objective, "objective")}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Assignments under objective */}
                                {isObjExpanded &&
                                  objAssignments.map((assignment) => {
                                    const statusInfo =
                                      statuses.find((s) => s.value === assignment.status) || statuses[0]
                                    return (
                                      <div
                                        key={assignment.id}
                                        className="ml-10 flex items-center gap-3 border-t bg-muted/20 p-3"
                                      >
                                        <button
                                          onClick={() =>
                                            handleStatusChange(
                                              assignment,
                                              assignment.status === "completed" ? "pending" : "completed"
                                            )
                                          }
                                          className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                            assignment.status === "completed"
                                              ? "border-emerald-500 bg-emerald-500 text-white"
                                              : "border-gray-300"
                                          }`}
                                        >
                                          {assignment.status === "completed" && <Check className="h-3 w-3" />}
                                        </button>
                                        <span
                                          className={`flex-1 text-sm ${
                                            assignment.status === "completed"
                                              ? "text-muted-foreground line-through"
                                              : ""
                                          }`}
                                        >
                                          {assignment.title}
                                        </span>
                                        <Badge variant="secondary" className={`text-xs ${statusInfo.color}`}>
                                          {statusInfo.label}
                                        </Badge>
                                      </div>
                                    )
                                  })}
                              </div>
                            )
                          })}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 font-medium">No goals defined yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create a goal to start building the Golden Thread hierarchy
                  </p>
                  <Button className="mt-4 bg-amber-500 hover:bg-amber-600" onClick={() => openCreateModal("goal")}>
                    Create First Goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check-ins Sub-tab */}
        <TabsContent value="checkins" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Check-in History ({checkIns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkIns.length > 0 ? (
                <div className="space-y-4">
                  {checkIns.map((checkIn) => {
                    const isMorning = checkIn.type === "morning"
                    return (
                      <div key={checkIn.id} className="flex gap-4 rounded-lg border p-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                            isMorning
                              ? "bg-gradient-to-br from-amber-500 to-orange-500"
                              : "bg-gradient-to-br from-indigo-500 to-purple-500"
                          }`}
                        >
                          {isMorning ? (
                            <Sunrise className="h-5 w-5 text-white" />
                          ) : (
                            <Moon className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-medium">
                              {isMorning ? "Morning Check-in" : "Evening Check-in"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {checkIn.createdAt && formatDate(checkIn.createdAt, "long")}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { label: "Mood", value: checkIn.mood, color: "#069494" },
                              { label: "Craving", value: checkIn.cravings, color: "#f97316" },
                              { label: "Anxiety", value: checkIn.anxiety, color: "#8b5cf6" },
                              { label: "Sleep", value: checkIn.sleep, color: "#3b82f6" },
                            ].map((metric) => (
                              <div key={metric.label} className="rounded-lg bg-muted/50 p-2 text-center">
                                <p className="text-xs text-muted-foreground">{metric.label}</p>
                                <p
                                  className="text-xl font-bold"
                                  style={{ color: metric.value != null ? metric.color : "#ccc" }}
                                >
                                  {metric.value ?? "-"}
                                </p>
                              </div>
                            ))}
                          </div>
                          {checkIn.notes && (
                            <div className="mt-3 rounded-lg border-l-2 border-primary bg-muted/50 p-3 text-sm">
                              {checkIn.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <ClipboardCheck className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">No check-ins recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reflections Sub-tab */}
        <TabsContent value="reflections" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gratitudes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Gratitudes ({gratitudes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gratitudes.length > 0 ? (
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {gratitudes.map((gratitude) => (
                      <div key={gratitude.id} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                            {gratitude.theme || "General"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {gratitude.createdAt && formatTimeAgo(gratitude.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{gratitude.content || gratitude.text || "No content"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Heart className="h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">No gratitudes recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reflections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  Evening Reflections ({reflections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reflections.length > 0 ? (
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {reflections.map((reflection) => (
                      <div key={reflection.id} className="rounded-lg border p-3">
                        <p className="mb-2 text-xs text-muted-foreground">
                          {reflection.createdAt && formatTimeAgo(reflection.createdAt)}
                        </p>
                        <p className="text-sm">{reflection.content || reflection.text || "No content"}</p>
                        {reflection.wins && reflection.wins.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-emerald-600">Today's Wins:</p>
                            <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                              {reflection.wins.map((win, i) => (
                                <li key={i}>{win}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">No reflections recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Breakthroughs */}
          {breakthroughs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Breakthroughs ({breakthroughs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-2">
                  {breakthroughs.map((breakthrough) => (
                    <div
                      key={breakthrough.id}
                      className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4"
                    >
                      <p className="mb-2 text-xs font-medium text-amber-600">
                        {breakthrough.createdAt && formatTimeAgo(breakthrough.createdAt)}
                      </p>
                      <p className="text-sm">{breakthrough.content || breakthrough.text || "Breakthrough moment"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "edit" ? `Edit ${modalType}` : `Create ${modalType}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={`Enter ${modalType} title`}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add description..."
              />
            </div>
            {modalType === "assignment" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) =>
                        setFormData({ ...formData, priority: v as "low" | "medium" | "high" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          status: v as "pending" | "in_progress" | "completed",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses
                          .filter((s) => s.value !== "overdue")
                          .map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.title.trim() || saving}>
              {saving ? "Saving..." : modalMode === "edit" ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==========================================
// ACTIVITY TAB
// ==========================================
function ActivityTab({
  activities,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  filterType,
  onFilterChange,
}: {
  activities: ActivityTypeInterface[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  filterType: string
  onFilterChange: (type: string) => void
}) {
  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "check_in", label: "Check-ins" },
    { value: "assignment_completed", label: "Assignments" },
    { value: "goal_completed", label: "Goals" },
    { value: "message_sent", label: "Messages" },
    { value: "sos_triggered", label: "SOS Alerts" },
    { value: "meeting_attended", label: "Meetings" },
    { value: "reflection_added", label: "Reflections" },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter:</Label>
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activities List */}
      <Card>
        <CardContent className="p-0">
          {activities.length > 0 ? (
            <div className="divide-y">
              {activities.map((activity) => {
                const config = getActivityConfig(activity.type)
                const Icon = config.icon
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bgClass}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description || activity.type.replace(/_/g, " ")}</p>
                      {activity.message && (
                        <p className="mt-1 text-sm text-muted-foreground">{activity.message}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.createdAt && formatTimeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No activities found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// MESSAGES TAB
// ==========================================
function MessagesTab({
  pirId,
  pirData,
  adminUser,
}: {
  pirId: string
  pirData: PIRUser
  adminUser: { id: string; displayName?: string; firstName?: string; email: string }
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Real-time message listener
  useEffect(() => {
    if (!pirId || !adminUser?.id) return

    setLoading(true)
    let sentMessages: Message[] = []
    let receivedMessages: Message[] = []

    const updateAllMessages = () => {
      const combined = [...sentMessages, ...receivedMessages]
      combined.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateA - dateB
      })
      setMessages(combined)
      setLoading(false)
    }

    // Listen for sent messages (coach -> PIR)
    const unsubscribeSent = onSnapshot(
      query(
        collection(db, "messages"),
        where("senderId", "==", adminUser.id),
        where("recipientId", "==", pirId),
        orderBy("createdAt", "desc"),
        limit(50)
      ),
      (snap) => {
        sentMessages = snap.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            senderId: data.senderId,
            senderName: data.senderName,
            recipientId: data.recipientId,
            recipientName: data.recipientName,
            text: data.text,
            content: data.content,
            type: data.type,
            imageUrl: data.imageUrl,
            status: data.status,
            readAt: data.readAt?.toDate?.(),
            direction: "sent" as const,
            createdAt: data.createdAt?.toDate?.(),
          }
        })
        updateAllMessages()
      }
    )

    // Listen for received messages (PIR -> coach)
    const unsubscribeReceived = onSnapshot(
      query(
        collection(db, "messages"),
        where("senderId", "==", pirId),
        where("recipientId", "==", adminUser.id),
        orderBy("createdAt", "desc"),
        limit(50)
      ),
      (snap) => {
        receivedMessages = snap.docs.map((docSnap) => {
          const data = docSnap.data()
          // Mark as read if not already
          if (!data.readAt) {
            updateDoc(doc(db, "messages", docSnap.id), {
              readAt: serverTimestamp(),
              status: "read",
            }).catch(() => {})
          }
          return {
            id: docSnap.id,
            senderId: data.senderId,
            senderName: data.senderName,
            recipientId: data.recipientId,
            recipientName: data.recipientName,
            text: data.text,
            content: data.content,
            type: data.type,
            imageUrl: data.imageUrl,
            status: data.status,
            readAt: data.readAt?.toDate?.(),
            direction: "received" as const,
            createdAt: data.createdAt?.toDate?.(),
          }
        })
        updateAllMessages()
      }
    )

    return () => {
      unsubscribeSent()
      unsubscribeReceived()
    }
  }, [pirId, adminUser?.id])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !adminUser) return

    try {
      setSending(true)
      await addDoc(collection(db, "messages"), {
        senderId: adminUser.id,
        senderName: adminUser.displayName || adminUser.firstName || "Coach",
        recipientId: pirId,
        recipientName: pirData?.displayName || pirData?.firstName || "PIR",
        text: newMessage.trim(),
        type: "text",
        status: "sent",
        createdAt: serverTimestamp(),
      })

      setNewMessage("")

      await logAudit("message_sent", {
        targetUserId: pirId,
        resource: "messages",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const pirName = pirData?.displayName || pirData?.firstName || "PIR"
  const pirInitial = pirName.charAt(0).toUpperCase()
  const coachName = adminUser?.displayName || adminUser?.firstName || "Coach"
  const coachInitial = coachName.charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
        <Skeleton className="h-16" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-350px)] min-h-[500px] flex-col">
      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <CardHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={pirData?.profilePhoto} />
              <AvatarFallback className="bg-purple-100 text-purple-700">{pirInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-base">Conversation with {pirName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
        </CardHeader>

        {/* Messages List */}
        <CardContent className="flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4">
          {messages.length > 0 ? (
            <>
              {messages.map((message, i) => {
                const isSent = message.direction === "sent"
                const messageDate = message.createdAt ? new Date(message.createdAt) : new Date()
                const prevDate =
                  i > 0 && messages[i - 1].createdAt
                    ? new Date(messages[i - 1].createdAt!)
                    : null
                const showDateSeparator =
                  i === 0 || (prevDate && messageDate.toDateString() !== prevDate.toDateString())

                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="my-4 flex justify-center">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          {messageDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    <div className={`flex items-end gap-2 ${isSent ? "justify-end" : "justify-start"}`}>
                      {!isSent && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={pirData?.profilePhoto} />
                          <AvatarFallback className="bg-purple-100 text-sm text-purple-700">
                            {pirInitial}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          isSent
                            ? "rounded-br-sm bg-[#069494] text-white"
                            : "rounded-bl-sm bg-gray-100 text-gray-900"
                        }`}
                      >
                        {/* Image if present */}
                        {message.imageUrl && (
                          <img
                            src={message.imageUrl}
                            alt="Attachment"
                            className="mb-2 max-h-48 max-w-48 cursor-pointer rounded-lg"
                            onClick={() => setSelectedImage(message.imageUrl!)}
                          />
                        )}
                        {/* Message text */}
                        {(message.text || message.content) && (
                          <p className="text-sm leading-relaxed">{message.text || message.content}</p>
                        )}
                        {/* Timestamp */}
                        <div
                          className={`mt-1 flex items-center gap-1 text-xs ${
                            isSent ? "justify-end opacity-70" : "text-muted-foreground"
                          }`}
                        >
                          {messageDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {isSent && message.status && (
                            <span>
                              {message.status === "read" ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3 opacity-70" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSent && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#069494] text-sm text-white">
                            {coachInitial}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="mb-4 h-16 w-16 opacity-30" />
              <p className="text-lg">No messages yet</p>
              <p className="mt-1 text-sm">Send a message to start the conversation</p>
            </div>
          )}
        </CardContent>

        {/* Message Input */}
        <div className="flex items-end gap-3 border-t bg-background p-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-3xl border-muted-foreground/20 px-4 py-3"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="h-12 w-12 shrink-0 rounded-full bg-[#069494] hover:bg-[#057575]"
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </Card>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-h-[90%] max-w-[90%] rounded-lg object-contain"
          />
          <button
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}

// ==========================================
// COMMUNITY TAB
// ==========================================
function CommunityTab({
  pirId,
  adminUser,
}: {
  pirId: string
  adminUser: { id: string; displayName?: string; email: string }
}) {
  const [posts, setPosts] = useState<DailyPost[]>([])
  const [loading, setLoading] = useState(true)
  const [moderating, setModerating] = useState<string | null>(null)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [activeSubTab, setActiveSubTab] = useState("posts")

  // Load posts
  useEffect(() => {
    if (!pirId) return

    setLoading(true)
    const unsubscribe = onSnapshot(
      query(
        collection(db, "dailyPosts"),
        where("pirId", "==", pirId),
        orderBy("createdAt", "desc"),
        limit(50)
      ),
      (snap) => {
        const postsData: DailyPost[] = snap.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            pirId: data.pirId,
            content: data.content || data.text || "",
            type: data.type,
            imageUrl: data.imageUrl,
            anonymous: data.anonymous,
            hidden: data.hidden,
            flagged: data.flagged,
            likes: data.likes || [],
            commentCount: data.commentCount || 0,
            moderatedAt: data.moderatedAt?.toDate?.(),
            moderatedBy: data.moderatedBy,
            moderatorName: data.moderatorName,
            createdAt: data.createdAt?.toDate?.(),
          }
        })
        setPosts(postsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading posts:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [pirId])

  // Load comments for a post
  const loadComments = async (postId: string) => {
    if (postComments[postId]) return

    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }))
      const snap = await getDocs(
        query(
          collection(db, "dailyPosts", postId, "comments"),
          orderBy("createdAt", "desc")
        )
      )
      const comments: PostComment[] = snap.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          postId,
          authorId: data.authorId,
          authorName: data.authorName,
          text: data.text,
          createdAt: data.createdAt?.toDate?.(),
        }
      })
      setPostComments((prev) => ({ ...prev, [postId]: comments }))
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }))
    }
  }

  // Toggle post visibility (hide/unhide)
  const handleToggleVisibility = async (postId: string, currentHidden: boolean) => {
    try {
      setModerating(postId)
      await updateDoc(doc(db, "dailyPosts", postId), {
        hidden: !currentHidden,
        moderatedAt: serverTimestamp(),
        moderatedBy: adminUser.id,
        moderatorName: adminUser.displayName || adminUser.email,
      })

      await logAudit(currentHidden ? "post_unhidden" : "post_hidden", {
        targetUserId: pirId,
        resource: "dailyPosts",
        resourceId: postId,
      })

      toast.success(currentHidden ? "Post unhidden" : "Post hidden")
    } catch (error) {
      console.error("Error toggling post visibility:", error)
      toast.error("Failed to moderate post")
    } finally {
      setModerating(null)
    }
  }

  // Delete a comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await deleteDoc(doc(db, "dailyPosts", postId, "comments", commentId))
      setPostComments((prev) => ({
        ...prev,
        [postId]: prev[postId]?.filter((c) => c.id !== commentId) || [],
      }))

      // Update comment count
      const post = posts.find((p) => p.id === postId)
      if (post) {
        await updateDoc(doc(db, "dailyPosts", postId), {
          commentCount: Math.max(0, (post.commentCount || 1) - 1),
        })
      }

      await logAudit("comment_deleted", {
        targetUserId: pirId,
        resource: "comments",
        resourceId: commentId,
      })

      toast.success("Comment deleted")
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  // Calculate stats
  const stats = useMemo(
    () => ({
      totalPosts: posts.length,
      reflections: posts.filter((p) => p.type === "reflection").length,
      wins: posts.filter((p) => p.type === "win").length,
      hidden: posts.filter((p) => p.hidden).length,
      flagged: posts.filter((p) => p.flagged).length,
      totalLikes: posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0),
      totalComments: posts.reduce((sum, p) => sum + (p.commentCount || 0), 0),
    }),
    [posts]
  )

  // Get post type styling
  const getPostTypeStyle = (type?: string) => {
    switch (type) {
      case "win":
        return { bgClass: "bg-amber-50", textClass: "text-amber-700", icon: Trophy, label: "Win" }
      case "reflection":
        return { bgClass: "bg-purple-50", textClass: "text-purple-700", icon: Moon, label: "Reflection" }
      default:
        return { bgClass: "bg-blue-50", textClass: "text-blue-700", icon: MessageCircle, label: "Post" }
    }
  }

  // Filter posts based on sub-tab
  const filteredPosts = useMemo(() => {
    if (activeSubTab === "flagged") return posts.filter((p) => p.flagged)
    return posts
  }, [posts, activeSubTab])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-72" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{stats.totalPosts}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.totalLikes}</p>
            <p className="text-sm text-muted-foreground">Total Likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.totalComments}</p>
            <p className="text-sm text-muted-foreground">Total Comments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-bold ${stats.flagged > 0 ? "text-red-600" : "text-gray-400"}`}>
              {stats.flagged}
            </p>
            <p className="text-sm text-muted-foreground">Flagged</p>
          </CardContent>
        </Card>
      </div>

      {/* Type Breakdown */}
      <div className="flex gap-3">
        <Card className="flex-1 bg-purple-50/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Moon className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-xl font-semibold text-purple-700">{stats.reflections}</p>
              <p className="text-xs text-muted-foreground">Reflections</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-amber-50/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-xl font-semibold text-amber-700">{stats.wins}</p>
              <p className="text-xs text-muted-foreground">Wins Shared</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`flex-1 ${stats.hidden > 0 ? "bg-red-50/50" : ""}`}>
          <CardContent className="flex items-center gap-3 p-4">
            <EyeOff className={`h-6 w-6 ${stats.hidden > 0 ? "text-red-600" : "text-gray-400"}`} />
            <div>
              <p className={`text-xl font-semibold ${stats.hidden > 0 ? "text-red-700" : "text-gray-400"}`}>
                {stats.hidden}
              </p>
              <p className="text-xs text-muted-foreground">Hidden Posts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="posts" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            My Day Posts
            {stats.totalPosts > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.totalPosts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="flagged" className="gap-2">
            <Flag className="h-4 w-4" />
            Flagged Content
            {stats.flagged > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.flagged}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="font-semibold">No Posts Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This PIR hasn&apos;t shared any &quot;My Day&quot; posts in the community.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => {
              const postStyle = getPostTypeStyle(post.type)
              const PostIcon = postStyle.icon
              const isExpanded = expandedPost === post.id
              const comments = postComments[post.id] || []
              const isLoadingComments = loadingComments[post.id]

              return (
                <Card
                  key={post.id}
                  className={`${post.hidden ? "border-2 border-red-300 opacity-70" : post.flagged ? "border-2 border-orange-300" : ""}`}
                >
                  <CardContent className="p-5">
                    {/* Post Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${postStyle.bgClass} ${postStyle.textClass}`}>
                          <PostIcon className="mr-1 h-3 w-3" />
                          {postStyle.label}
                        </Badge>
                        {post.anonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                        {post.hidden && (
                          <Badge variant="destructive" className="gap-1">
                            <EyeOff className="h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                        {post.flagged && !post.hidden && (
                          <Badge className="gap-1 bg-orange-500">
                            <Flag className="h-3 w-3" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.createdAt && formatTimeAgo(post.createdAt)}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="mb-4 leading-relaxed text-foreground">{post.content}</p>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post attachment"
                        className="mb-4 max-h-64 rounded-lg object-cover"
                      />
                    )}

                    {/* Engagement Stats */}
                    <div className="mb-4 flex items-center gap-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-400" />
                        {post.likes?.length || 0} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        {post.commentCount || 0} comments
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!isExpanded) loadComments(post.id)
                          setExpandedPost(isExpanded ? null : post.id)
                        }}
                      >
                        <MessageSquare className="mr-1 h-4 w-4" />
                        {isExpanded ? "Hide" : "View"} Comments
                      </Button>
                      <Button
                        variant={post.hidden ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleToggleVisibility(post.id, !!post.hidden)}
                        disabled={moderating === post.id}
                        className={post.hidden ? "border-emerald-300 text-emerald-600 hover:bg-emerald-50" : ""}
                      >
                        {post.hidden ? (
                          <>
                            <Eye className="mr-1 h-4 w-4" />
                            Unhide
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-4 w-4" />
                            Hide
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        <h5 className="mb-3 text-sm font-medium">Comments ({comments.length})</h5>
                        {isLoadingComments ? (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            Loading comments...
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            No comments on this post
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start justify-between rounded-lg bg-muted/50 p-3"
                              >
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-primary">
                                    {comment.authorName || "Anonymous"}
                                  </p>
                                  <p className="mt-1 text-sm">{comment.text}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {comment.createdAt && formatTimeAgo(comment.createdAt)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="flagged" className="mt-4 space-y-4">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Flag className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="font-semibold">No Flagged Content</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No posts from this PIR have been flagged.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => {
              const postStyle = getPostTypeStyle(post.type)
              const PostIcon = postStyle.icon

              return (
                <Card key={post.id} className="border-2 border-orange-300">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${postStyle.bgClass} ${postStyle.textClass}`}>
                          <PostIcon className="mr-1 h-3 w-3" />
                          {postStyle.label}
                        </Badge>
                        <Badge className="gap-1 bg-orange-500">
                          <Flag className="h-3 w-3" />
                          Flagged
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.createdAt && formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="mb-4 leading-relaxed">{post.content}</p>
                    <div className="flex gap-2">
                      <Button
                        variant={post.hidden ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleToggleVisibility(post.id, !!post.hidden)}
                        disabled={moderating === post.id}
                        className={post.hidden ? "border-emerald-300 text-emerald-600 hover:bg-emerald-50" : ""}
                      >
                        {post.hidden ? (
                          <>
                            <Eye className="mr-1 h-4 w-4" />
                            Unhide
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-4 w-4" />
                            Hide
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==========================================
// MEETINGS TAB
// ==========================================
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function MeetingsTab({
  pirId,
}: {
  pirId: string
}) {
  const [activeSubTab, setActiveSubTab] = useState("today")
  const [savedMeetings, setSavedMeetings] = useState<SavedMeeting[]>([])
  const [loading, setLoading] = useState(true)

  // Load saved meetings
  useEffect(() => {
    if (!pirId) return

    setLoading(true)
    const unsubscribe = onSnapshot(
      query(
        collection(db, "users", pirId, "savedMeetings"),
        orderBy("savedAt", "desc")
      ),
      (snap) => {
        const meetings: SavedMeeting[] = snap.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "Unnamed Meeting",
            day: data.day,
            time: data.time,
            location: data.location,
            address: data.address,
            city: data.city,
            type: data.type,
            types: data.types,
            source: data.source,
            isVirtual: data.isVirtual,
            conferenceUrl: data.conferenceUrl,
            notes: data.notes,
            savedAt: data.savedAt?.toDate(),
            addedBy: data.addedBy,
            addedByName: data.addedByName,
            attendance: data.attendance,
            lastAttendance: data.lastAttendance?.toDate(),
          }
        })
        setSavedMeetings(meetings)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading saved meetings:", error)
        toast.error("Failed to load meetings")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [pirId])

  // Get today's day
  const today = new Date()
  const todayDayName = DAY_NAMES[today.getDay()]
  const todayDateKey = today.toISOString().split("T")[0]

  // Check if meeting was added by staff
  const isAddedByStaff = (meeting: SavedMeeting) => meeting.addedBy && meeting.addedBy !== pirId

  // Filter meetings
  const todayMeetings = savedMeetings.filter((m) => {
    const meetingDayName = typeof m.day === "number" ? DAY_NAMES[m.day] : m.day
    return meetingDayName === todayDayName
  })
  const staffAddedMeetings = savedMeetings.filter((m) => isAddedByStaff(m))

  // Get filtered meetings based on sub-tab
  const getFilteredMeetings = () => {
    switch (activeSubTab) {
      case "today":
        return todayMeetings
      case "staffAdded":
        return staffAddedMeetings
      default:
        return savedMeetings
    }
  }

  const filteredMeetings = getFilteredMeetings()

  // Mark attendance
  const markAttendance = async (meeting: SavedMeeting, attended: boolean) => {
    try {
      await updateDoc(doc(db, "users", pirId, "savedMeetings", meeting.id), {
        [`attendance.${todayDateKey}`]: attended,
        lastAttendance: attended ? serverTimestamp() : null,
      })
      toast.success(attended ? "Marked as attended" : "Marked as missed")
    } catch (error) {
      console.error("Error marking attendance:", error)
      toast.error("Failed to mark attendance")
    }
  }

  // Get today's attendance status
  const getTodayAttendance = (meeting: SavedMeeting) => meeting.attendance?.[todayDateKey]

  // Remove meeting
  const removeMeeting = async (meeting: SavedMeeting) => {
    if (!confirm("Remove this meeting from saved list?")) return
    try {
      await deleteDoc(doc(db, "users", pirId, "savedMeetings", meeting.id))
      toast.success("Meeting removed")
    } catch (error) {
      console.error("Error removing meeting:", error)
      toast.error("Failed to remove meeting")
    }
  }

  // Stats
  const stats = {
    total: savedMeetings.length,
    today: todayMeetings.length,
    staffAdded: staffAddedMeetings.length,
    aaMeetings: savedMeetings.filter((m) => m.source === "aa" || m.type === "AA").length,
  }

  const subTabs = [
    { id: "today", label: "Today's Meetings", count: stats.today },
    { id: "all", label: "All Saved", count: stats.total },
    { id: "staffAdded", label: "Added by Staff", count: stats.staffAdded },
  ]

  // Meeting card component
  const MeetingCard = ({ meeting, showAttendance = false }: { meeting: SavedMeeting; showAttendance?: boolean }) => {
    const staffAdded = isAddedByStaff(meeting)
    const todayAttended = getTodayAttendance(meeting)
    const meetingDay = typeof meeting.day === "number" ? DAY_NAMES[meeting.day] : meeting.day
    const isToday = meetingDay === todayDayName

    return (
      <Card className={staffAdded ? "border-2 border-purple-500" : ""}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Day Badge */}
            <div
              className={`flex min-w-[60px] flex-col items-center rounded-lg p-3 text-white ${
                isToday ? "bg-gradient-to-br from-orange-500 to-orange-600" : "bg-gradient-to-br from-primary to-primary/80"
              }`}
            >
              <span className="text-[11px] font-medium uppercase">{meetingDay?.slice(0, 3)}</span>
              <span className="mt-0.5 text-base font-bold">{meeting.time || "--:--"}</span>
            </div>

            {/* Meeting Details */}
            <div className="flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold">{meeting.name}</span>
                {/* Source Badge */}
                <Badge variant="secondary" className={meeting.source === "aa" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}>
                  {meeting.source?.toUpperCase() || meeting.type || "Meeting"}
                </Badge>
                {/* Staff Added Badge */}
                {staffAdded && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                    <UserPlus className="mr-1 h-3 w-3" />
                    Added by staff
                  </Badge>
                )}
                {/* Virtual Badge */}
                {meeting.isVirtual && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Video className="mr-1 h-3 w-3" />
                    Virtual
                  </Badge>
                )}
              </div>

              {/* Location */}
              {meeting.location && (
                <div className="mb-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <MapIcon className="h-3.5 w-3.5" />
                  {meeting.location}
                </div>
              )}

              {/* Address */}
              {meeting.address && (
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {meeting.address}
                  {meeting.city && `, ${meeting.city}`}
                </div>
              )}

              {/* Types/Format */}
              {meeting.types && meeting.types.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {meeting.types.slice(0, 5).map((type, i) => (
                    <Badge key={i} variant="outline" className="text-[11px]">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Saved info */}
              {meeting.savedAt && (
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Saved {formatDate(meeting.savedAt, "short")}
                  {staffAdded && meeting.addedByName && ` by ${meeting.addedByName}`}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2">
              {/* Attendance buttons for today's meetings */}
              {showAttendance && isToday && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={todayAttended === true ? "default" : "outline"}
                    className={todayAttended === true ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => markAttendance(meeting, true)}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Attended
                  </Button>
                  <Button
                    size="sm"
                    variant={todayAttended === false ? "destructive" : "outline"}
                    onClick={() => markAttendance(meeting, false)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Missed
                  </Button>
                </div>
              )}

              {/* Conference URL */}
              {meeting.conferenceUrl && (
                <Button size="sm" variant="outline" asChild>
                  <a href={meeting.conferenceUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-1 h-3 w-3" />
                    Join
                  </a>
                </Button>
              )}

              {/* Remove button */}
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => removeMeeting(meeting)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          {subTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              {tab.label}
              <Badge variant="secondary" className="ml-1">
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Staff Added Info Banner */}
        {activeSubTab === "staffAdded" && stats.staffAdded > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-4">
            <UserPlus className="h-6 w-6 text-purple-700" />
            <div>
              <div className="font-semibold text-purple-900">
                {stats.staffAdded} meeting{stats.staffAdded !== 1 ? "s" : ""} added by staff
              </div>
              <div className="text-sm text-purple-700">These meetings were recommended by the recovery coach</div>
            </div>
          </div>
        )}

        {/* Meetings List */}
        <TabsContent value={activeSubTab} className="mt-4 space-y-4">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} showAttendance={activeSubTab === "today"} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Calendar className="mb-4 h-16 w-16 text-muted-foreground/30" />
                <p className="text-lg text-muted-foreground">
                  {activeSubTab === "today"
                    ? "No meetings scheduled for today"
                    : activeSubTab === "staffAdded"
                    ? "No staff-recommended meetings"
                    : "No saved meetings"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeSubTab === "staffAdded"
                    ? "Add meetings for this PIR to help their recovery"
                    : "Browse AA/NA meetings and save them for this PIR"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Stats Summary */}
      {savedMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Meeting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Saved", value: stats.total, color: "text-primary" },
                { label: "Today", value: stats.today, color: "text-orange-500" },
                { label: "Staff Added", value: stats.staffAdded, color: "text-purple-600" },
                { label: "AA Meetings", value: stats.aaMeetings, color: "text-emerald-600" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ==========================================
// GUIDES TAB
// ==========================================
function GuidesTab({
  pirId,
  adminUser,
}: {
  pirId: string
  adminUser: { id: string; displayName?: string; email?: string }
}) {
  const [activeSubTab, setActiveSubTab] = useState("assigned")
  const [resources, setResources] = useState<Resource[]>([])
  const [assignedResources, setAssignedResources] = useState<AssignedResource[]>([])
  const [resourceProgress, setResourceProgress] = useState<Record<string, ResourceProgress>>({})
  const [coachNotes, setCoachNotes] = useState<GuideNote[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<GuideNote | null>(null)
  const [noteText, setNoteText] = useState("")
  const [noteResourceId, setNoteResourceId] = useState("")
  const [saving, setSaving] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  // Load resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true)
        // Load all resources
        const resourcesSnap = await getDocs(
          query(collection(db, "resources"), orderBy("title", "asc"), limit(200))
        )
        const allResources: Resource[] = resourcesSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Resource, "id">),
        }))
        setResources(allResources)

        // Load assigned resources (resources where assignedTo contains pirId)
        const assignedSnap = await getDocs(
          query(collection(db, "resources"), where("assignedTo", "array-contains", pirId))
        )
        const assigned: AssignedResource[] = assignedSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AssignedResource, "id">),
        }))
        setAssignedResources(assigned)

        // Load resource progress
        const progressSnap = await getDocs(collection(db, "users", pirId, "resourceProgress"))
        const progress: Record<string, ResourceProgress> = {}
        progressSnap.docs.forEach((doc) => {
          const data = doc.data()
          progress[doc.id] = {
            resourceId: doc.id,
            status: data.status || "not-started",
            percentComplete: data.percentComplete || 0,
            lastViewed: data.lastViewed?.toDate(),
            notes: data.notes,
          }
        })
        setResourceProgress(progress)
      } catch (error) {
        console.error("Error loading resources:", error)
        toast.error("Failed to load resources")
      } finally {
        setLoading(false)
      }
    }

    if (pirId) loadResources()
  }, [pirId])

  // Load coach notes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoadingNotes(true)
        const notesSnap = await getDocs(
          query(collection(db, "guideNotes"), where("pirId", "==", pirId), orderBy("createdAt", "desc"))
        )
        const notes: GuideNote[] = notesSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<GuideNote, "id">),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        setCoachNotes(notes)
      } catch (error) {
        console.error("Error loading guide notes:", error)
      } finally {
        setLoadingNotes(false)
      }
    }

    if (pirId) loadNotes()
  }, [pirId])

  // Get available resources (not yet assigned)
  const availableResources = resources.filter((r) => !assignedResources.some((ar) => ar.id === r.id))

  // Get unique categories
  const categories = [...new Set(resources.map((r) => r.category).filter(Boolean))]

  // Filter resources
  const filterResources = (resourceList: Resource[]) => {
    return resourceList.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }

  // Get progress status
  const getProgressStatus = (resourceId: string) => {
    const progress = resourceProgress[resourceId]
    if (!progress) return { status: "not-started" as const, percent: 0 }
    return {
      status: progress.status,
      percent: progress.percentComplete,
      lastViewed: progress.lastViewed,
      notes: progress.notes,
    }
  }

  // Status styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { bgClass: "bg-emerald-100", textClass: "text-emerald-700", icon: CheckCircle, label: "Completed" }
      case "in-progress":
        return { bgClass: "bg-blue-100", textClass: "text-blue-700", icon: Clock, label: "In Progress" }
      default:
        return { bgClass: "bg-gray-100", textClass: "text-gray-600", icon: Circle, label: "Not Started" }
    }
  }

  // Assign resource
  const handleAssignResource = async (resourceId: string) => {
    try {
      setAssigning(resourceId)
      await updateDoc(doc(db, "resources", resourceId), {
        assignedTo: arrayUnion(pirId),
      })

      // Log activity
      await addDoc(collection(db, "activities"), {
        userId: pirId,
        type: "resource_assigned",
        resourceId,
        assignedBy: adminUser.id,
        assignedByName: adminUser.displayName || adminUser.email,
        createdAt: serverTimestamp(),
      })

      // Update local state
      const resource = resources.find((r) => r.id === resourceId)
      if (resource) {
        setAssignedResources([...assignedResources, { ...resource, assignedTo: [pirId] }])
      }

      toast.success("Resource assigned")
    } catch (error) {
      console.error("Error assigning resource:", error)
      toast.error("Failed to assign resource")
    } finally {
      setAssigning(null)
    }
  }

  // Unassign resource
  const handleUnassignResource = async (resourceId: string) => {
    if (!confirm("Remove this assignment?")) return
    try {
      setAssigning(resourceId)
      await updateDoc(doc(db, "resources", resourceId), {
        assignedTo: arrayRemove(pirId),
      })

      // Log activity
      await addDoc(collection(db, "activities"), {
        userId: pirId,
        type: "resource_unassigned",
        resourceId,
        unassignedBy: adminUser.id,
        unassignedByName: adminUser.displayName || adminUser.email,
        createdAt: serverTimestamp(),
      })

      // Update local state
      setAssignedResources(assignedResources.filter((r) => r.id !== resourceId))
      toast.success("Resource removed")
    } catch (error) {
      console.error("Error unassigning resource:", error)
      toast.error("Failed to remove resource")
    } finally {
      setAssigning(null)
    }
  }

  // Save coach note
  const handleSaveNote = async () => {
    if (!noteText.trim()) return
    try {
      setSaving(true)
      if (editingNote) {
        await updateDoc(doc(db, "guideNotes", editingNote.id), {
          text: noteText.trim(),
          resourceId: noteResourceId || null,
          updatedAt: serverTimestamp(),
          updatedBy: adminUser.id,
        })
        setCoachNotes(
          coachNotes.map((n) => (n.id === editingNote.id ? { ...n, text: noteText, resourceId: noteResourceId } : n))
        )
        toast.success("Note updated")
      } else {
        const docRef = await addDoc(collection(db, "guideNotes"), {
          pirId,
          text: noteText.trim(),
          resourceId: noteResourceId || null,
          createdAt: serverTimestamp(),
          createdBy: adminUser.id,
          coachName: adminUser.displayName || adminUser.email,
        })
        setCoachNotes([
          {
            id: docRef.id,
            pirId,
            text: noteText,
            resourceId: noteResourceId,
            createdAt: new Date(),
            coachName: adminUser.displayName || adminUser.email,
          },
          ...coachNotes,
        ])
        toast.success("Note added")
      }
      setNoteText("")
      setNoteResourceId("")
      setShowAddNote(false)
      setEditingNote(null)
    } catch (error) {
      console.error("Error saving note:", error)
      toast.error("Failed to save note")
    } finally {
      setSaving(false)
    }
  }

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return
    try {
      await deleteDoc(doc(db, "guideNotes", noteId))
      setCoachNotes(coachNotes.filter((n) => n.id !== noteId))
      toast.success("Note deleted")
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note")
    }
  }

  // Get resource by ID
  const getResourceById = (id: string) => resources.find((r) => r.id === id)

  // Calculate stats
  const stats = {
    totalAssigned: assignedResources.length,
    completed: assignedResources.filter((r) => getProgressStatus(r.id).status === "completed").length,
    inProgress: assignedResources.filter((r) => getProgressStatus(r.id).status === "in-progress").length,
    notStarted: assignedResources.filter((r) => getProgressStatus(r.id).status === "not-started").length,
  }
  const completionRate = stats.totalAssigned > 0 ? Math.round((stats.completed / stats.totalAssigned) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Assigned", value: stats.totalAssigned, color: "text-primary" },
          { label: "Completed", value: stats.completed, color: "text-emerald-600" },
          { label: "In Progress", value: stats.inProgress, color: "text-orange-500" },
          { label: "Completion Rate", value: `${completionRate}%`, color: "text-purple-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Assigned
            <Badge variant="secondary">{stats.totalAssigned}</Badge>
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Available
            <Badge variant="secondary">{availableResources.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Coach Notes
            <Badge variant="secondary">{coachNotes.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Search and Filter (for assigned and available) */}
        {(activeSubTab === "assigned" || activeSubTab === "available") && (
          <div className="mt-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Assigned Resources */}
        <TabsContent value="assigned" className="mt-4 space-y-4">
          {filterResources(assignedResources).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">No Assigned Resources</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
                    ? "No resources match your search."
                    : "Go to Available to assign resources."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filterResources(assignedResources).map((resource) => {
              const progress = getProgressStatus(resource.id)
              const statusConfig = getStatusConfig(progress.status)
              const StatusIcon = statusConfig.icon

              return (
                <Card key={resource.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{resource.title}</h4>
                            {resource.category && (
                              <Badge variant="secondary" className="mt-1 text-[11px]">
                                {resource.category}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {resource.description && (
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
                        )}

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="mb-1.5 flex items-center justify-between">
                            <Badge className={`${statusConfig.bgClass} ${statusConfig.textClass}`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{progress.percent}% complete</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full transition-all ${
                                progress.status === "completed"
                                  ? "bg-emerald-500"
                                  : progress.status === "in-progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                        </div>

                        {/* PIR Notes */}
                        {progress.notes && (
                          <div className="mt-3 rounded-lg border-l-2 border-primary bg-muted/50 p-3">
                            <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
                              <MessageSquare className="h-3 w-3" />
                              PIR Notes
                            </div>
                            <p className="text-sm italic text-muted-foreground">"{progress.notes}"</p>
                          </div>
                        )}

                        {/* Last Viewed */}
                        {progress.lastViewed && (
                          <div className="mt-2 text-[11px] text-muted-foreground">
                            Last viewed: {formatDate(progress.lastViewed, "short")}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex gap-2">
                        {resource.url && (
                          <Button size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleUnassignResource(resource.id)}
                          disabled={assigning === resource.id}
                        >
                          <X className="mr-1 h-3 w-3" />
                          {assigning === resource.id ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* Available Resources */}
        <TabsContent value="available" className="mt-4">
          {filterResources(availableResources).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CheckCircle className="mb-4 h-12 w-12 text-emerald-500/30" />
                <h3 className="text-lg font-semibold">All Resources Assigned</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
                    ? "No resources match your search."
                    : "All available resources have been assigned."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filterResources(availableResources).map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="flex flex-col p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{resource.title}</h4>
                        {resource.category && (
                          <Badge variant="secondary" className="mt-1 text-[11px]">
                            {resource.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {resource.description && (
                      <p className="mb-3 flex-1 line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
                    )}

                    <Button
                      onClick={() => handleAssignResource(resource.id)}
                      disabled={assigning === resource.id}
                      className="w-full"
                    >
                      {assigning === resource.id ? (
                        "Assigning..."
                      ) : (
                        <>
                          <Plus className="mr-1 h-4 w-4" />
                          Assign to PIR
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Coach Notes */}
        <TabsContent value="notes" className="mt-4 space-y-4">
          {/* Add Note Button */}
          <Button
            onClick={() => {
              setShowAddNote(true)
              setEditingNote(null)
              setNoteText("")
              setNoteResourceId("")
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Coach Note
          </Button>

          {/* Add/Edit Note Form */}
          {showAddNote && (
            <Card className="border-2 border-primary">
              <CardContent className="p-6">
                <h4 className="mb-4 font-semibold">{editingNote ? "Edit Note" : "New Coach Note"}</h4>

                <div className="mb-4">
                  <Label className="mb-2 block text-sm">Related Resource (Optional)</Label>
                  <Select value={noteResourceId} onValueChange={setNoteResourceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="No specific resource" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific resource</SelectItem>
                      {assignedResources.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <Label className="mb-2 block text-sm">Note</Label>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter your observations, recommendations, or notes..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddNote(false)
                      setEditingNote(null)
                      setNoteText("")
                      setNoteResourceId("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote} disabled={saving || !noteText.trim()}>
                    {saving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes List */}
          {loadingNotes ? (
            <div className="py-8 text-center text-muted-foreground">Loading notes...</div>
          ) : coachNotes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">No Coach Notes</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add notes to track this PIR's progress with resources.</p>
              </CardContent>
            </Card>
          ) : (
            coachNotes.map((note) => {
              const relatedResource = note.resourceId ? getResourceById(note.resourceId) : null
              return (
                <Card key={note.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {relatedResource && (
                          <div className="mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">{relatedResource.title}</span>
                          </div>
                        )}
                        <p className="text-sm">{note.text}</p>
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {note.coachName && `By ${note.coachName} • `}
                          {note.createdAt && formatDate(note.createdAt, "short")}
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNote(note)
                            setNoteText(note.text)
                            setNoteResourceId(note.resourceId || "")
                            setShowAddNote(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==========================================
// JOURNEY TAB
// ==========================================
const STANDARD_MILESTONES = [
  { days: 1, label: "24 Hours", icon: Sunrise, color: "#FFD93D" },
  { days: 7, label: "1 Week", icon: Calendar, color: "#6BCB77" },
  { days: 14, label: "2 Weeks", icon: Star, color: "#4D96FF" },
  { days: 30, label: "1 Month", icon: Award, color: "#9D65C9" },
  { days: 60, label: "2 Months", icon: Award, color: "#FF6B6B" },
  { days: 90, label: "3 Months", icon: Trophy, color: "#00A86B" },
  { days: 180, label: "6 Months", icon: Trophy, color: "#FF6B35" },
  { days: 365, label: "1 Year", icon: Crown, color: "#FFD700" },
  { days: 730, label: "2 Years", icon: Crown, color: "#E6B800" },
  { days: 1095, label: "3 Years", icon: Sparkles, color: "#9D65C9" },
  { days: 1825, label: "5 Years", icon: Sparkles, color: "#DC143C" },
]

interface HeatmapDay {
  date: string
  dayOfWeek: number
  dayOfMonth: number
  month: number
  hasActivity: boolean
  count: number
  mood: number
}

interface TimelineItem {
  id: string
  type: "gratitude" | "reflection" | "breakthrough"
  title: string
  content: string
  date: Date
  icon: typeof Heart
  color: string
}

function JourneyTab({
  pirData,
  checkIns,
  gratitudes,
  reflections,
  breakthroughs,
}: {
  pirData: PIRUser
  checkIns: CheckIn[]
  gratitudes: Gratitude[]
  reflections: Reflection[]
  breakthroughs: Breakthrough[]
}) {
  const [activeSubTab, setActiveSubTab] = useState("milestones")
  const sobrietyDays = pirData?.sobrietyDays || 0

  // Calculate achieved and upcoming milestones
  const achievedMilestones = STANDARD_MILESTONES.filter((m) => sobrietyDays >= m.days)
  const upcomingMilestones = STANDARD_MILESTONES.filter((m) => sobrietyDays < m.days).slice(0, 3)
  const nextMilestone = upcomingMilestones[0]

  // Generate 90-day calendar heatmap data
  const generateHeatmapData = (): HeatmapDay[] => {
    const today = new Date()
    const days: HeatmapDay[] = []
    const checkInDates: Map<string, { count: number; mood: number }> = new Map()

    // Map check-ins to dates
    if (checkIns && checkIns.length > 0) {
      checkIns.forEach((checkin) => {
        const date = checkin.createdAt instanceof Date ? checkin.createdAt : new Date()
        const dateKey = date.toISOString().split("T")[0]
        if (!checkInDates.has(dateKey)) {
          checkInDates.set(dateKey, { count: 0, mood: 0 })
        }
        const entry = checkInDates.get(dateKey)!
        entry.count++
        const mood = checkin.mood ?? 5
        entry.mood = Math.max(entry.mood, mood)
      })
    }

    // Generate last 90 days
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      const data = checkInDates.get(dateKey)

      days.push({
        date: dateKey,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        month: date.getMonth(),
        hasActivity: !!data,
        count: data?.count || 0,
        mood: data?.mood || 0,
      })
    }

    return days
  }

  const heatmapData = generateHeatmapData()

  // Get heatmap intensity color (teal scale)
  const getHeatmapColor = (day: HeatmapDay) => {
    if (!day.hasActivity) return "#f0f0f0"
    if (day.mood >= 8) return "#0d9488" // teal-600
    if (day.mood >= 6) return "#14b8a6" // teal-500
    if (day.mood >= 4) return "#5eead4" // teal-300
    if (day.mood >= 2) return "#99f6e4" // teal-200
    return "#ccfbf1" // teal-100
  }

  // Combine journey timeline items
  const getTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = []

    gratitudes?.forEach((g) => {
      items.push({
        id: g.id,
        type: "gratitude",
        title: "Gratitude",
        content: g.text || g.content || "",
        date: g.createdAt instanceof Date ? g.createdAt : new Date(),
        icon: Heart,
        color: "#FF6B6B",
      })
    })

    reflections?.forEach((r) => {
      items.push({
        id: r.id,
        type: "reflection",
        title: "Reflection",
        content: r.text || r.content || "",
        date: r.createdAt instanceof Date ? r.createdAt : new Date(),
        icon: Moon,
        color: "#9C27B0",
      })
    })

    breakthroughs?.forEach((b) => {
      items.push({
        id: b.id,
        type: "breakthrough",
        title: "Breakthrough",
        content: b.text || b.content || "",
        date: b.createdAt instanceof Date ? b.createdAt : new Date(),
        icon: Zap,
        color: "#FFD700",
      })
    })

    // Sort by date descending
    return items.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const timelineItems = getTimelineItems()

  // Stats
  const stats = {
    gratitudes: gratitudes?.length || 0,
    reflections: reflections?.length || 0,
    breakthroughs: breakthroughs?.length || 0,
    activeDays: heatmapData.filter((d) => d.hasActivity).length,
  }

  return (
    <div className="space-y-6">
      {/* Sobriety Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-emerald-600 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 text-sm opacity-90">Recovery Journey</div>
            <div className="text-5xl font-bold">{sobrietyDays.toLocaleString()}</div>
            <div className="mt-1 text-lg opacity-90">Days Sober</div>
            {pirData?.sobrietyDate && (
              <div className="mt-3 text-sm opacity-70">Since {formatDate(pirData.sobrietyDate)}</div>
            )}
          </div>
          {nextMilestone && (
            <div className="rounded-xl bg-white/15 p-5 text-right">
              <div className="mb-1 text-sm opacity-90">Next Milestone</div>
              <div className="text-2xl font-bold">{nextMilestone.label}</div>
              <div className="text-sm opacity-90">{nextMilestone.days - sobrietyDays} days away</div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Milestones Sub-tab */}
        <TabsContent value="milestones" className="mt-4 space-y-6">
          {/* Achieved Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Achieved Milestones ({achievedMilestones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievedMilestones.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {achievedMilestones.map((milestone, index) => {
                    const Icon = milestone.icon
                    return (
                      <div
                        key={index}
                        className="rounded-xl border-2 p-4 text-center"
                        style={{
                          backgroundColor: `${milestone.color}15`,
                          borderColor: `${milestone.color}30`,
                        }}
                      >
                        <div
                          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                          style={{ backgroundColor: milestone.color }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="font-bold">{milestone.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{milestone.days} days</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">First milestone (24 hours) coming up!</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          {upcomingMilestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-primary" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingMilestones.map((milestone, index) => {
                  const Icon = milestone.icon
                  const daysRemaining = milestone.days - sobrietyDays
                  const progress = Math.min(100, Math.round((sobrietyDays / milestone.days) * 100))

                  return (
                    <div key={index} className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-semibold">{milestone.label}</span>
                          <span className="text-sm text-muted-foreground">{daysRemaining} days away</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: milestone.color }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{progress}% complete</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Heatmap Sub-tab */}
        <TabsContent value="heatmap" className="mt-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Active Days", value: stats.activeDays, sublabel: "/ 90 days", color: "text-primary" },
              { label: "Gratitudes", value: stats.gratitudes, sublabel: "entries", color: "text-red-500" },
              { label: "Reflections", value: stats.reflections, sublabel: "entries", color: "text-purple-600" },
              { label: "Breakthroughs", value: stats.breakthroughs, sublabel: "moments", color: "text-amber-500" },
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-5 text-center">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="mt-1 text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 90-Day Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                90-Day Activity Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="mb-5 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Less</span>
                {["#f0f0f0", "#ccfbf1", "#99f6e4", "#5eead4", "#14b8a6", "#0d9488"].map((color, i) => (
                  <div key={i} className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
                ))}
                <span>More / Better Mood</span>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto">
                <div className="grid min-w-[650px] grid-cols-13 grid-rows-7 gap-1">
                  {/* Week day labels */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                    <div
                      key={`label-${i}`}
                      className="flex items-center justify-end pr-2 text-[10px] text-muted-foreground"
                    >
                      {i % 2 === 1 ? day : ""}
                    </div>
                  ))}

                  {/* Heatmap cells organized by week */}
                  {Array.from({ length: 13 }).flatMap((_, weekIndex) =>
                    Array.from({ length: 7 }).map((_, dayIndex) => {
                      const dataIndex = weekIndex * 7 + dayIndex
                      const day = heatmapData[dataIndex]

                      if (!day) return <div key={`empty-${weekIndex}-${dayIndex}`} />

                      return (
                        <div
                          key={`cell-${weekIndex}-${dayIndex}`}
                          title={`${day.date}: ${day.count} check-in(s), mood: ${day.mood || "N/A"}`}
                          className="h-3.5 w-3.5 cursor-pointer rounded transition-transform hover:scale-125"
                          style={{
                            backgroundColor: getHeatmapColor(day),
                            gridColumn: weekIndex + 2,
                            gridRow: dayIndex + 1,
                          }}
                        />
                      )
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                {stats.activeDays} of 90 days with activity ({Math.round((stats.activeDays / 90) * 100)}% engagement)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Sub-tab */}
        <TabsContent value="timeline" className="mt-4">
          {timelineItems.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Journey Timeline ({timelineItems.length} entries)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8">
                  {/* Timeline line */}
                  <div className="absolute bottom-6 left-3 top-6 w-0.5 bg-muted" />

                  {timelineItems.slice(0, 20).map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div key={item.id} className={`relative pl-4 ${index < timelineItems.length - 1 ? "mb-6" : ""}`}>
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full shadow"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="h-3 w-3 text-white" />
                        </div>

                        {/* Content */}
                        <div className="rounded-xl bg-muted/50 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{ backgroundColor: `${item.color}20`, color: item.color }}
                            >
                              {item.title}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{item.content || "No content"}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {timelineItems.length > 20 && (
                  <div className="mt-5 border-t pt-5 text-center text-sm text-muted-foreground">
                    Showing 20 of {timelineItems.length} entries
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">No Journey Entries Yet</h3>
                <p className="mt-1 text-muted-foreground">
                  Gratitudes, reflections, and breakthroughs will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==========================================
// FINANCIAL TAB
// ==========================================
function FinancialTab({
  pirData,
  savingsItems,
  savingsGoals,
}: {
  pirData: PIRUser
  savingsItems: SavingsItem[]
  savingsGoals: SavingsGoal[]
}) {
  const [activeSubTab, setActiveSubTab] = useState("overview")

  const dailyCost = pirData?.dailyCost || 20
  const sobrietyDays = pirData?.sobrietyDays || 0

  // Calculate money saved
  const totalSaved = sobrietyDays * dailyCost
  const weeklyRate = dailyCost * 7
  const monthlyRate = dailyCost * 30
  const yearlyRate = dailyCost * 365

  // Calculate time-based metrics
  const weeksSober = Math.floor(sobrietyDays / 7)
  const monthsSober = Math.floor(sobrietyDays / 30)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate savings items total
  const savingsItemsTotal = savingsItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  // Calculate goal progress
  const getGoalProgress = (goal: SavingsGoal) => {
    const saved = goal.currentAmount || 0
    const target = goal.targetAmount || 1
    return Math.min(100, Math.round((saved / target) * 100))
  }

  const completedGoals = savingsGoals.filter((g) => getGoalProgress(g) >= 100).length

  return (
    <div className="space-y-6">
      {/* Money Saved Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-center text-white">
        <div className="mb-2 text-sm opacity-90">Total Money Saved</div>
        <div className="mb-2 text-5xl font-bold">{formatCurrency(totalSaved)}</div>
        <div className="text-sm opacity-80">
          Based on ${dailyCost}/day over {sobrietyDays} days of sobriety
        </div>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Daily Rate", value: formatCurrency(dailyCost), color: "text-primary" },
          { label: "Weekly", value: formatCurrency(weeklyRate), color: "text-purple-600" },
          { label: "Monthly", value: formatCurrency(monthlyRate), color: "text-orange-500" },
          { label: "Yearly", value: formatCurrency(yearlyRate), color: "text-amber-600" },
        ].map((rate, index) => (
          <Card key={index}>
            <CardContent className="p-5 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{rate.label}</span>
              </div>
              <div className={`text-2xl font-bold ${rate.color}`}>{rate.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Savings Goals
            <Badge variant="secondary">{savingsGoals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Savings Items
            <Badge variant="secondary">{savingsItems.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-2 gap-5">
            {/* Savings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Savings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">{formatCurrency(dailyCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">This Week ({Math.min(sobrietyDays, 7)} days)</span>
                  <span className="font-semibold">{formatCurrency(Math.min(sobrietyDays, 7) * dailyCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">This Month ({Math.min(sobrietyDays, 30)} days)</span>
                  <span className="font-semibold">{formatCurrency(Math.min(sobrietyDays, 30) * dailyCost)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Lifetime Savings</span>
                  <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalSaved)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Financial Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Financial Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">Projected 1 Year</div>
                    <div className="text-xl font-bold text-primary">{formatCurrency(yearlyRate)}</div>
                  </div>
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-purple-500/10 p-4">
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">Projected 5 Years</div>
                    <div className="text-xl font-bold text-purple-600">{formatCurrency(yearlyRate * 5)}</div>
                  </div>
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Recovery Progress Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Days Sober", value: sobrietyDays, color: "text-emerald-600" },
                    { label: "Weeks Sober", value: weeksSober, color: "text-primary" },
                    { label: "Months Sober", value: monthsSober, color: "text-purple-600" },
                    { label: "Goals Achieved", value: completedGoals, color: "text-orange-500" },
                  ].map((stat, index) => (
                    <div key={index} className="rounded-xl bg-muted/50 p-4 text-center">
                      <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Savings Goals Tab */}
        <TabsContent value="goals" className="mt-4 space-y-4">
          {savingsGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Target className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">No Savings Goals</h3>
                <p className="mt-1 text-muted-foreground">
                  This PIR hasn't set any savings goals yet. Goals are managed by the PIR in their app.
                </p>
              </CardContent>
            </Card>
          ) : (
            savingsGoals.map((goal) => {
              const progress = getGoalProgress(goal)
              const isComplete = progress >= 100
              return (
                <Card key={goal.id} className={isComplete ? "border-2 border-emerald-500" : ""}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            isComplete ? "bg-emerald-600" : "bg-primary/15"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : (
                            <Target className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{goal.name || "Unnamed Goal"}</h4>
                          {goal.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${isComplete ? "text-emerald-600" : ""}`}>
                          {formatCurrency(goal.currentAmount || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">of {formatCurrency(goal.targetAmount || 0)}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={`font-semibold ${isComplete ? "text-emerald-600" : "text-primary"}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isComplete ? "bg-gradient-to-r from-emerald-600 to-emerald-500" : "bg-gradient-to-r from-primary to-primary/80"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Goal Metadata */}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {goal.targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Target: {formatDate(goal.targetDate)}
                        </span>
                      )}
                      {goal.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Created: {formatDate(goal.createdAt)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* Savings Items Tab */}
        <TabsContent value="items" className="mt-4 space-y-4">
          {/* Total Summary */}
          {savingsItems.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="font-medium">Total Saved in Items</span>
              </div>
              <span className="text-2xl font-bold text-primary">{formatCurrency(savingsItemsTotal)}</span>
            </div>
          )}

          {savingsItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Wallet className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">No Savings Items</h3>
                <p className="mt-1 text-muted-foreground">
                  This PIR hasn't logged any savings items. Items are managed by the PIR in their app.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {savingsItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15">
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.name || item.description || "Savings Entry"}</h4>
                          {item.category && (
                            <Badge variant="secondary" className="mt-1 text-[11px]">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-emerald-600">{formatCurrency(item.amount || 0)}</div>
                    </div>
                    {item.notes && <p className="mt-3 text-sm text-muted-foreground">{item.notes}</p>}
                    {item.createdAt && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
            <Info className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <strong>View Only:</strong> Savings items are managed by the PIR through their app. Coaches can view
              financial progress but cannot add or modify savings entries.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==========================================
// DOCUMENTATION TAB
// ==========================================
function DocumentationTab({ pirId }: { pirId: string }) {
  const [activeSubTab, setActiveSubTab] = useState("intake")
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)

  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true)
        const docsSnap = await getDocs(
          query(collection(db, "documents"), where("pirId", "==", pirId), orderBy("createdAt", "desc"))
        )
        const docs: DocumentType[] = docsSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<DocumentType, "id">),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        setDocuments(docs)
      } catch (error) {
        console.error("Error loading documents:", error)
      } finally {
        setLoading(false)
      }
    }

    if (pirId) loadDocuments()
  }, [pirId])

  // Document counts by type
  const docCounts = {
    intake: documents.filter((d) => d.type === "intake").length,
    progressNotes: documents.filter((d) => d.type === "progress_note").length,
    discharge: documents.filter((d) => d.type === "discharge").length,
    other: documents.filter((d) => d.type === "other").length,
  }

  const subTabs = [
    { id: "intake", label: "Intake", icon: FileText, count: docCounts.intake },
    { id: "progressNotes", label: "Progress Notes", icon: ClipboardCheck, count: docCounts.progressNotes },
    { id: "discharge", label: "Discharge", icon: FileCheck, count: docCounts.discharge },
    { id: "other", label: "Other", icon: Folder, count: docCounts.other },
  ]

  const docDescriptions: Record<string, string> = {
    intake:
      "Initial assessment forms, consent documents, and admission paperwork will appear here when the Templates system is integrated.",
    progressNotes: "Session notes, treatment updates, and progress documentation will be organized chronologically here.",
    discharge: "Discharge summaries, aftercare plans, and completion certificates will be stored in this section.",
    other: "Additional documents, correspondence, and miscellaneous files can be uploaded and categorized here.",
  }

  // Get filtered documents for current sub-tab
  const getDocsForTab = () => {
    const typeMap: Record<string, DocumentType["type"]> = {
      intake: "intake",
      progressNotes: "progress_note",
      discharge: "discharge",
      other: "other",
    }
    return documents.filter((d) => d.type === typeMap[activeSubTab])
  }

  const currentDocs = getDocsForTab()

  // Document placeholder component
  const DocumentPlaceholder = ({ type, Icon, description }: { type: string; Icon: typeof FileText; description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <Icon className="h-5 w-5 text-primary" />
          {type} Documents
        </CardTitle>
        <Button disabled variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-16">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Icon className="h-9 w-9 text-muted-foreground" />
        </div>
        <h4 className="mb-2 font-semibold">No {type} Documents</h4>
        <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 px-5 py-2.5 text-sm font-medium text-purple-700">
          <Clock className="h-4 w-4" />
          Coming Soon - Document Upload & Templates
        </div>
      </CardContent>
      <div className="border-t bg-muted/30 p-5">
        <div className="mb-3 text-xs font-medium text-muted-foreground">Planned Features:</div>
        <div className="flex flex-wrap gap-2">
          {["Template Selection", "Auto-fill from Profile", "E-signature", "PDF Export", "Version History"].map(
            (feature) => (
              <Badge key={feature} variant="outline" className="bg-white text-[11px]">
                {feature}
              </Badge>
            )
          )}
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="w-full justify-start">
          {subTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex flex-1 items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
                <Badge variant="secondary">{tab.count}</Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Content for each sub-tab */}
        {subTabs.map((tab) => {
          const Icon = tab.icon
          const docs = tab.id === activeSubTab ? currentDocs : []

          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {docs.length > 0 ? (
                <div className="space-y-4">
                  {docs.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{doc.title}</h4>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              {doc.fileName && <span>{doc.fileName}</span>}
                              {doc.createdAt && <span>{formatDate(doc.createdAt)}</span>}
                              {doc.uploadedByName && <span>by {doc.uploadedByName}</span>}
                            </div>
                          </div>
                        </div>
                        {doc.fileUrl && (
                          <Button size="sm" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <DocumentPlaceholder
                  type={tab.label}
                  Icon={Icon}
                  description={docDescriptions[tab.id] || "Documents will appear here."}
                />
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Integration Info Card */}
      <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50 p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white">
          <Link className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h4 className="mb-1 font-semibold text-emerald-800">Templates Integration</h4>
          <p className="text-sm text-emerald-700">
            This Documentation tab will sync with the Templates system when built. Templates created in Settings will be
            available for document generation here, with auto-population of client data and e-signature capabilities.
          </p>
        </div>
      </div>
    </div>
  )
}


// ==========================================
// MAIN USER DETAIL PAGE
// ==========================================
export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { adminUser } = useAuth()

  // Check for edit mode from URL query param
  const initialEditMode = searchParams.get("edit") === "true"

  const [pirData, setPirData] = useState<PIRUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Overview data
  const [coaches, setCoaches] = useState<Coach[]>([])

  // Activity data
  const [activities, setActivities] = useState<ActivityTypeInterface[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activityFilter, setActivityFilter] = useState("all")
  const [activityPage, setActivityPage] = useState(1)
  const ACTIVITIES_PER_PAGE = 20

  // Wellness/Tasks data
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [objectives, setObjectives] = useState<ObjectiveWithGoal[]>([])
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [breakthroughs, setBreakthroughs] = useState<Breakthrough[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)

  // Financial data
  const [savingsItems, setSavingsItems] = useState<SavingsItem[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [_financialLoading, setFinancialLoading] = useState(true)

  // Load PIR data
  const loadPirData = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const pirDoc = await getDoc(doc(db, "users", id))
      if (pirDoc.exists()) {
        const data = pirDoc.data()
        setPirData({
          id: pirDoc.id,
          uid: data.uid || pirDoc.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          profilePhoto: data.profilePhoto,
          role: "pir",
          tenantId: data.tenantId,
          status: data.status || "active",
          sobrietyDate: data.sobrietyDate,
          sobrietyDays: calculateSobrietyDays(data.sobrietyDate),
          substance: data.substance,
          dailyCost: data.dailyCost || 20,
          moneySaved: calculateSobrietyDays(data.sobrietyDate) * (data.dailyCost || 20),
          program: data.program,
          assignedCoach: data.assignedCoach,
          assignedCoachName: data.assignedCoachName,
          assignedCoachEmail: data.assignedCoachEmail,
          emergencyContacts: data.emergencyContacts || [],
          createdAt: data.createdAt?.toDate?.(),
          lastLogin: data.lastLogin?.toDate?.(),
          lastActivity: data.lastActivity?.toDate?.(),
          totalCheckIns: data.totalCheckIns,
          streakDays: data.streakDays,
          complianceRate: data.complianceRate,
        })
      } else {
        toast.error("PIR not found")
        navigate("/users")
      }
    } catch (error) {
      console.error("Error loading PIR:", error)
      toast.error("Failed to load PIR data")
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  // Load coaches
  const loadCoaches = useCallback(async () => {
    try {
      const coachesSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "in", ["coach", "admin"]),
          orderBy("displayName", "asc")
        )
      )

      const coachesData: Coach[] = []
      coachesSnap.forEach((docSnap) => {
        const data = docSnap.data()
        coachesData.push({
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          tenantId: data.tenantId,
        })
      })
      setCoaches(coachesData)
    } catch (error) {
      console.error("Error loading coaches:", error)
    }
  }, [])

  // Load activities
  const loadActivities = useCallback(async () => {
    if (!id) return

    setActivitiesLoading(true)
    try {
      const activitiesSnap = await getDocs(
        query(collection(db, "activities"), where("pirId", "==", id), orderBy("createdAt", "desc"), limit(200))
      )

      const activitiesData: ActivityTypeInterface[] = []
      activitiesSnap.forEach((docSnap) => {
        const data = docSnap.data()
        activitiesData.push({
          id: docSnap.id,
          type: data.type,
          description: data.description,
          message: data.message,
          pirId: data.pirId,
          userId: data.userId,
          metadata: data.metadata,
          createdAt: data.createdAt?.toDate?.(),
          tenantId: data.tenantId,
        })
      })
      setActivities(activitiesData)
    } catch (error) {
      console.error("Error loading activities:", error)
    } finally {
      setActivitiesLoading(false)
    }
  }, [id])

  // Load check-ins
  const loadCheckIns = useCallback(async () => {
    if (!id) return

    setCheckInsLoading(true)
    try {
      const checkInsSnap = await getDocs(
        query(collection(db, "checkIns"), where("pirId", "==", id), orderBy("createdAt", "desc"), limit(100))
      )

      const checkInsData: CheckIn[] = []
      checkInsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        checkInsData.push({
          id: docSnap.id,
          pirId: data.pirId,
          type: data.type || "morning",
          mood: data.mood ?? data.morningData?.mood,
          cravings: data.craving ?? data.cravings ?? data.morningData?.craving,
          anxiety: data.anxiety ?? data.morningData?.anxiety,
          sleep: data.sleep ?? data.morningData?.sleep,
          gratitude: data.gratitude,
          challenges: data.challenges,
          notes: data.notes,
          createdAt: data.createdAt?.toDate?.(),
          tenantId: data.tenantId,
        })
      })
      setCheckIns(checkInsData)
    } catch (error) {
      console.error("Error loading check-ins:", error)
    } finally {
      setCheckInsLoading(false)
    }
  }, [id])

  // Load tasks data (assignments, goals, objectives, reflections)
  const loadTasksData = useCallback(async () => {
    if (!id) return

    setTasksLoading(true)
    try {
      // Load assignments
      const assignmentsSnap = await getDocs(
        query(collection(db, "assignments"), where("pirId", "==", id), orderBy("createdAt", "desc"))
      )
      const assignmentsData: Assignment[] = []
      assignmentsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        assignmentsData.push({
          id: docSnap.id,
          pirId: data.pirId,
          coachId: data.coachId,
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status || "pending",
          priority: data.priority || "medium",
          dueDate: data.dueDate?.toDate?.(),
          createdAt: data.createdAt?.toDate?.(),
          completedAt: data.completedAt?.toDate?.(),
          tenantId: data.tenantId,
        })
      })
      setAssignments(assignmentsData)

      // Load goals
      const goalsSnap = await getDocs(
        query(collection(db, "goals"), where("pirId", "==", id), orderBy("createdAt", "desc"))
      )
      const goalsData: Goal[] = []
      goalsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        goalsData.push({
          id: docSnap.id,
          pirId: data.pirId,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status || "active",
          progress: data.progress,
          targetDate: data.targetDate?.toDate?.(),
          createdAt: data.createdAt?.toDate?.(),
          completedAt: data.completedAt?.toDate?.(),
          tenantId: data.tenantId,
        })
      })
      setGoals(goalsData)

      // Load objectives
      const objectivesSnap = await getDocs(
        query(collection(db, "objectives"), where("pirId", "==", id), orderBy("createdAt", "desc"))
      )
      const objectivesData: ObjectiveWithGoal[] = []
      objectivesSnap.forEach((docSnap) => {
        const data = docSnap.data()
        objectivesData.push({
          id: docSnap.id,
          goalId: data.goalId,
          title: data.title,
          description: data.description,
          completed: data.completed || false,
          completedAt: data.completedAt?.toDate?.(),
          createdAt: data.createdAt?.toDate?.(),
        })
      })
      setObjectives(objectivesData)

      // Load gratitudes
      const gratitudesSnap = await getDocs(
        query(collection(db, "gratitudes"), where("pirId", "==", id), orderBy("createdAt", "desc"), limit(50))
      )
      const gratitudesData: Gratitude[] = []
      gratitudesSnap.forEach((docSnap) => {
        const data = docSnap.data()
        gratitudesData.push({
          id: docSnap.id,
          pirId: data.pirId,
          content: data.content,
          text: data.text,
          theme: data.theme,
          createdAt: data.createdAt?.toDate?.(),
        })
      })
      setGratitudes(gratitudesData)

      // Load reflections
      const reflectionsSnap = await getDocs(
        query(collection(db, "reflections"), where("pirId", "==", id), orderBy("createdAt", "desc"), limit(50))
      )
      const reflectionsData: Reflection[] = []
      reflectionsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        reflectionsData.push({
          id: docSnap.id,
          pirId: data.pirId,
          content: data.content,
          text: data.text,
          wins: data.wins,
          createdAt: data.createdAt?.toDate?.(),
        })
      })
      setReflections(reflectionsData)

      // Load breakthroughs
      const breakthroughsSnap = await getDocs(
        query(collection(db, "breakthroughs"), where("pirId", "==", id), orderBy("createdAt", "desc"), limit(20))
      )
      const breakthroughsData: Breakthrough[] = []
      breakthroughsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        breakthroughsData.push({
          id: docSnap.id,
          pirId: data.pirId,
          content: data.content,
          text: data.text,
          createdAt: data.createdAt?.toDate?.(),
        })
      })
      setBreakthroughs(breakthroughsData)
    } catch (error) {
      console.error("Error loading tasks data:", error)
    } finally {
      setTasksLoading(false)
    }
  }, [id])

  // Load financial data
  const loadFinancialData = useCallback(async () => {
    if (!id) return

    setFinancialLoading(true)
    try {
      // Load savings items
      const savingsItemsSnap = await getDocs(
        query(collection(db, "savingsItems"), where("pirId", "==", id), orderBy("createdAt", "desc"))
      )
      const itemsData: SavingsItem[] = []
      savingsItemsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        itemsData.push({
          id: docSnap.id,
          pirId: data.pirId,
          name: data.name,
          description: data.description,
          amount: data.amount || 0,
          category: data.category,
          notes: data.notes,
          createdAt: data.createdAt?.toDate?.(),
        })
      })
      setSavingsItems(itemsData)

      // Load savings goals
      const savingsGoalsSnap = await getDocs(
        query(collection(db, "savingsGoals"), where("pirId", "==", id), orderBy("createdAt", "desc"))
      )
      const goalsData: SavingsGoal[] = []
      savingsGoalsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        goalsData.push({
          id: docSnap.id,
          pirId: data.pirId,
          name: data.name,
          description: data.description,
          targetAmount: data.targetAmount || 0,
          currentAmount: data.currentAmount || 0,
          targetDate: data.targetDate?.toDate?.(),
          status: data.status || "active",
          createdAt: data.createdAt?.toDate?.(),
          completedAt: data.completedAt?.toDate?.(),
        })
      })
      setSavingsGoals(goalsData)
    } catch (error) {
      console.error("Error loading financial data:", error)
    } finally {
      setFinancialLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPirData()
    loadCoaches()
    loadActivities()
    loadCheckIns()
    loadTasksData()
    loadFinancialData()
  }, [loadPirData, loadCoaches, loadActivities, loadCheckIns, loadTasksData, loadFinancialData])

  // Save PIR profile
  const handleSaveProfile = async (data: Partial<PIRUser>) => {
    if (!id) return

    await updateDoc(doc(db, "users", id), {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      sobrietyDate: data.sobrietyDate,
      substance: data.substance,
      dailyCost: data.dailyCost,
      emergencyContacts: data.emergencyContacts,
      updatedAt: serverTimestamp(),
    })

    await logAudit("pir_profile_updated", {
      targetUserId: id,
      resource: "users",
      resourceId: id,
    })

    await loadPirData()
  }

  // Change coach assignment
  const handleChangeCoach = async (coachId: string) => {
    if (!id) return

    const selectedCoach = coaches.find((c) => c.id === coachId)
    if (!selectedCoach) return

    await updateDoc(doc(db, "users", id), {
      assignedCoach: coachId,
      assignedCoachName: selectedCoach.displayName || `${selectedCoach.firstName} ${selectedCoach.lastName}`,
      assignedCoachEmail: selectedCoach.email,
      updatedAt: serverTimestamp(),
    })

    await logAudit("coach_assignment_changed", {
      targetUserId: id,
      resource: "users",
      resourceId: id,
    })

    toast.success("Coach assignment updated")
    await loadPirData()
  }

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (activityFilter === "all") return activities
    return activities.filter((a) => a.type === activityFilter)
  }, [activities, activityFilter])

  // Paginate activities
  const paginatedActivities = useMemo(() => {
    const start = (activityPage - 1) * ACTIVITIES_PER_PAGE
    return filteredActivities.slice(start, start + ACTIVITIES_PER_PAGE)
  }, [filteredActivities, activityPage])

  const totalActivityPages = Math.ceil(filteredActivities.length / ACTIVITIES_PER_PAGE)

  // Reset page when filter changes
  useEffect(() => {
    setActivityPage(1)
  }, [activityFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!pirData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">PIR not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={pirData.profilePhoto} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(pirData.displayName || pirData.firstName || pirData.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {pirData.displayName || `${pirData.firstName} ${pirData.lastName}` || pirData.email}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge
                variant="secondary"
                className={
                  pirData.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : pirData.status === "suspended"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }
              >
                {pirData.status || "Active"}
              </Badge>
              <span>{pirData.sobrietyDays} days sober</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            pirData={pirData}
            coaches={coaches}
            onSave={handleSaveProfile}
            onChangeCoach={handleChangeCoach}
            initialEditMode={initialEditMode}
          />
        </TabsContent>

        <TabsContent value="wellness" className="mt-6">
          <WellnessTab pirId={id!} checkIns={checkIns} checkInsLoading={checkInsLoading} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <TasksTab
            pirId={id!}
            assignments={assignments}
            setAssignments={setAssignments}
            goals={goals}
            setGoals={setGoals}
            objectives={objectives}
            setObjectives={setObjectives}
            checkIns={checkIns}
            gratitudes={gratitudes}
            reflections={reflections}
            breakthroughs={breakthroughs}
            loading={tasksLoading}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityTab
            activities={paginatedActivities}
            loading={activitiesLoading}
            currentPage={activityPage}
            totalPages={totalActivityPages}
            onPageChange={setActivityPage}
            filterType={activityFilter}
            onFilterChange={setActivityFilter}
          />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6">
          {id && pirData && adminUser && (
            <MessagesTab
              pirId={id}
              pirData={pirData}
              adminUser={{
                id: adminUser.id,
                displayName: adminUser.displayName,
                firstName: adminUser.firstName,
                email: adminUser.email,
              }}
            />
          )}
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="mt-6">
          {id && adminUser && (
            <CommunityTab
              pirId={id}
              adminUser={{
                id: adminUser.id,
                displayName: adminUser.displayName,
                email: adminUser.email,
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          {pirData && (
            <MeetingsTab pirId={pirData.id} />
          )}
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          {pirData && adminUser && (
            <GuidesTab
              pirId={pirData.id}
              adminUser={{
                id: adminUser.uid,
                displayName: adminUser.displayName || undefined,
                email: adminUser.email || undefined,
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="journey" className="mt-6">
          {pirData && (
            <JourneyTab
              pirData={pirData}
              checkIns={checkIns}
              gratitudes={gratitudes}
              reflections={reflections}
              breakthroughs={breakthroughs}
            />
          )}
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          {pirData && (
            <FinancialTab
              pirData={pirData}
              savingsItems={savingsItems}
              savingsGoals={savingsGoals}
            />
          )}
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          {id && <DocumentationTab pirId={id} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserDetail
