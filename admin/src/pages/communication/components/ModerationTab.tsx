import { useState, useEffect } from "react"
import {
  db,
  collection,
  query,
  where,
  getDocs,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Flag,
  Filter,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react"
import { FlaggedContentTab } from "./FlaggedContentTab"
import { KeywordFilteringTab } from "./KeywordFilteringTab"
import { UserWarningsTab } from "./UserWarningsTab"

interface ModerationStats {
  pendingReviews: number
  resolvedToday: number
  activeWarnings: number
}

export function ModerationTab() {
  const [activeSubTab, setActiveSubTab] = useState("flagged")
  const [stats, setStats] = useState<ModerationStats>({
    pendingReviews: 0,
    resolvedToday: 0,
    activeWarnings: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      // Get pending reviews count
      const pendingSnap = await getDocs(
        query(
          collection(db, "reportedContent"),
          where("tenantId", "==", CURRENT_TENANT),
          where("status", "==", "pending")
        )
      )

      // Get resolved today count
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const resolvedSnap = await getDocs(
        query(
          collection(db, "reportedContent"),
          where("tenantId", "==", CURRENT_TENANT),
          where("status", "==", "resolved")
        )
      )
      // Filter resolved today in memory since Firestore doesn't support complex date queries
      let resolvedToday = 0
      resolvedSnap.forEach((doc) => {
        const data = doc.data()
        if (data.resolvedAt?.toDate?.() >= today) {
          resolvedToday++
        }
      })

      // Get active warnings count
      const warningsSnap = await getDocs(
        query(
          collection(db, "userWarnings"),
          where("tenantId", "==", CURRENT_TENANT),
          where("acknowledged", "==", false)
        )
      )

      setStats({
        pendingReviews: pendingSnap.size,
        resolvedToday,
        activeWarnings: warningsSnap.size,
      })
    } catch (error) {
      console.error("Error loading moderation stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleRefreshStats = () => {
    loadStats()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold">{stats.pendingReviews}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold">{stats.resolvedToday}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Warnings</p>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold">{stats.activeWarnings}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="flagged" className="gap-2">
            <Flag className="h-4 w-4" />
            Flagged Content
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-2">
            <Filter className="h-4 w-4" />
            Keyword Filtering
          </TabsTrigger>
          <TabsTrigger value="warnings" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            User Warnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="mt-4">
          <FlaggedContentTab onRefreshStats={handleRefreshStats} />
        </TabsContent>

        <TabsContent value="keywords" className="mt-4">
          <KeywordFilteringTab />
        </TabsContent>

        <TabsContent value="warnings" className="mt-4">
          <UserWarningsTab onRefreshStats={handleRefreshStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ModerationTab
