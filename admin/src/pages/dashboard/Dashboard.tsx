import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore"
import { toast } from "sonner"
import {
  ActivityFeed,
  QuickActions,
  AlertsPanel,
  PriorityTasks,
  ActivePIRsGrid,
  CalendarWidget,
  DashboardCharts,
} from "./components"
import { PIR, Activity, Task } from "./types"
import type { CrisisAlert } from "@/pages/alerts/types"

interface Coach {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
}

// Tenant ID - in production this would come from config
const CURRENT_TENANT = "full-service"

export function Dashboard() {
  const navigate = useNavigate()
  const { adminUser, getDataScope } = useAuth()

  // Data state
  const [activePIRs, setActivePIRs] = useState<PIR[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [recentAlerts, setRecentAlerts] = useState<CrisisAlert[]>([])
  const [priorityTasks, setPriorityTasks] = useState<Task[]>([])

  // Loading state
  const [loading, setLoading] = useState(true)

  // Calculate days sober from sobriety date
  const calculateDaysSober = (sobrietyDate: Timestamp | Date | string | undefined): number => {
    if (!sobrietyDate) return 0
    try {
      let date: Date
      if (sobrietyDate instanceof Date) {
        date = sobrietyDate
      } else if (typeof sobrietyDate === "string") {
        date = new Date(sobrietyDate)
      } else if (sobrietyDate && typeof sobrietyDate === "object" && "toDate" in sobrietyDate) {
        date = sobrietyDate.toDate()
      } else {
        return 0
      }
      if (isNaN(date.getTime())) return 0
      const diffMs = Date.now() - date.getTime()
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    } catch {
      return 0
    }
  }

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!adminUser) return

    setLoading(true)
    const scope = getDataScope()

    try {
      // Load coaches first for PIR mapping
      const coachesSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "in", ["admin", "coach", "superadmin", "superadmin1"])
        )
      )

      const coachMap = new Map<string, Coach>()
      coachesSnap.forEach((doc) => {
        const data = doc.data()
        coachMap.set(doc.id, {
          id: doc.id,
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
        })
      })

      // Load PIRs based on data scope
      let pirsQuery = query(
        collection(db, "users"),
        where("tenantId", "==", CURRENT_TENANT),
        where("role", "==", "pir"),
        where("active", "==", true)
      )

      // Apply scope filtering for coaches
      if (scope === "assigned_pirs" && adminUser.uid) {
        pirsQuery = query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir"),
          where("active", "==", true),
          where("assignedCoach", "==", adminUser.uid)
        )
      }

      const pirsSnap = await getDocs(pirsQuery)
      const pirsList: PIR[] = []

      pirsSnap.forEach((doc) => {
        const data = doc.data()
        const coach = coachMap.get(data.assignedCoach)
        pirsList.push({
          id: doc.id,
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          profileImageUrl: data.profileImageUrl,
          role: data.role,
          tenantId: data.tenantId,
          assignedCoach: data.assignedCoach,
          coachName: coach?.displayName || coach?.firstName || "Unassigned",
          sobrietyDate: data.sobrietyDate,
          daysSober: calculateDaysSober(data.sobrietyDate),
          active: data.active,
          lastCheckIn: data.lastCheckIn,
          checkInStreak: data.checkInStreak,
        })
      })

      setActivePIRs(pirsList)

      // Load recent activities
      const pirIds = pirsList.map((p) => p.id)
      if (pirIds.length > 0) {
        // Firestore 'in' query limited to 30 items, batch if needed
        const activityBatch = pirIds.slice(0, 30)
        const activitiesSnap = await getDocs(
          query(
            collection(db, "activities"),
            where("userId", "in", activityBatch),
            orderBy("createdAt", "desc"),
            limit(50)
          )
        )

        const activitiesList: Activity[] = []
        activitiesSnap.forEach((doc) => {
          const data = doc.data()
          const pir = pirsList.find((p) => p.id === data.userId)
          activitiesList.push({
            id: doc.id,
            userId: data.userId,
            pirId: data.userId,
            pirName: pir?.displayName || pir?.firstName || "Unknown",
            type: data.type,
            description: data.description,
            metadata: data.metadata,
            createdAt: data.createdAt,
          })
        })
        setRecentActivity(activitiesList)
      }

      // Load recent crisis alerts (unread/acknowledged only for dashboard)
      let alertsQuery = query(
        collection(db, "crisisAlerts"),
        where("tenantId", "==", CURRENT_TENANT),
        where("status", "in", ["unread", "acknowledged", "responded", "escalated"]),
        orderBy("createdAt", "desc"),
        limit(10)
      )

      // Apply coach scope filtering if needed
      if (scope === "assigned_pirs" && adminUser.uid) {
        alertsQuery = query(
          collection(db, "crisisAlerts"),
          where("tenantId", "==", CURRENT_TENANT),
          where("coachId", "==", adminUser.uid),
          where("status", "in", ["unread", "acknowledged", "responded", "escalated"]),
          orderBy("createdAt", "desc"),
          limit(10)
        )
      }

      const alertsSnap = await getDocs(alertsQuery)

      const alertsList: CrisisAlert[] = []
      alertsSnap.forEach((doc) => {
        const data = doc.data()
        alertsList.push({
          id: doc.id,
          pirId: data.pirId,
          pirName: data.pirName || "Unknown",
          coachId: data.coachId,
          coachName: data.coachName,
          tenantId: data.tenantId,
          source: data.source || "checkin",
          tier: data.tier || 3,
          severity: data.severity || "medium",
          status: data.status,
          triggerKeywords: data.triggerKeywords || [],
          context: data.context || "",
          fullMessage: data.fullMessage || "",
          resourcesDisplayed: data.resourcesDisplayed || false,
          notificationsSent: data.notificationsSent || {
            push: false,
            email: false,
            sms: false,
            inApp: false,
          },
          responseLog: data.responseLog || [],
          responseNotes: data.responseNotes || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt,
          acknowledgedAt: data.acknowledgedAt || null,
          acknowledgedBy: data.acknowledgedBy || null,
          respondedAt: data.respondedAt || null,
          respondedBy: data.respondedBy || null,
          escalatedAt: data.escalatedAt || null,
          escalatedTo: data.escalatedTo || null,
          resolvedAt: data.resolvedAt || null,
          resolvedBy: data.resolvedBy || null,
        })
      })
      setRecentAlerts(alertsList)

      // Load priority tasks (assignments due soon or overdue)
      const now = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)

      if (pirIds.length > 0) {
        const tasksBatch = pirIds.slice(0, 30)
        const tasksSnap = await getDocs(
          query(
            collection(db, "assignments"),
            where("userId", "in", tasksBatch),
            where("status", "in", ["pending", "in_progress"]),
            orderBy("dueDate", "asc"),
            limit(20)
          )
        )

        const tasksList: Task[] = []
        tasksSnap.forEach((doc) => {
          const data = doc.data()
          const pir = pirsList.find((p) => p.id === data.userId)
          const dueDate = data.dueDate?.toDate?.() || new Date(data.dueDate)
          const isOverdue = dueDate < now

          tasksList.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            pirId: data.userId,
            pirName: pir?.displayName || pir?.firstName || "Unknown",
            dueDate: data.dueDate,
            status: isOverdue ? "overdue" : data.status,
            isOverdue,
            priority: data.priority,
            createdAt: data.createdAt,
          })
        })

        // Sort by overdue first, then by due date
        tasksList.sort((a, b) => {
          if (a.isOverdue && !b.isOverdue) return -1
          if (!a.isOverdue && b.isOverdue) return 1
          const dateA = a.dueDate instanceof Date ? a.dueDate : a.dueDate?.toDate?.() || new Date()
          const dateB = b.dueDate instanceof Date ? b.dueDate : b.dueDate?.toDate?.() || new Date()
          return dateA.getTime() - dateB.getTime()
        })

        setPriorityTasks(tasksList.slice(0, 10))
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [adminUser, getDataScope])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Handle PIR click - navigate to user detail
  const handlePIRClick = (pir: PIR) => {
    navigate(`/userdetail?id=${pir.id}`)
  }

  // Handle task click
  const handleTaskClick = (task: Task) => {
    navigate(`/userdetail?id=${task.pirId}`)
  }

  // Handle broadcast (placeholder)
  const handleSendBroadcast = () => {
    toast.info("Broadcast feature coming soon")
  }

  // Handle create PIR (placeholder)
  const handleCreatePIR = () => {
    navigate("/users?action=create")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {adminUser?.displayName || adminUser?.firstName || "Admin"}
        </p>
      </div>

      {/* Row 1: Recent Activity + Calendar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed
            activities={recentActivity}
            loading={loading}
            onViewAll={() => navigate("/logs")}
          />
        </div>
        <div>
          <CalendarWidget />
        </div>
      </div>

      {/* Row 2: Alerts + Priority Tasks + Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AlertsPanel alerts={recentAlerts} loading={loading} />
        <PriorityTasks
          tasks={priorityTasks}
          loading={loading}
          onTaskClick={handleTaskClick}
        />
        <QuickActions
          onSendBroadcast={handleSendBroadcast}
          onCreatePIR={handleCreatePIR}
        />
      </div>

      {/* Program Analytics Charts */}
      <DashboardCharts pirIds={activePIRs.map((p) => p.id)} />

      {/* Active PIRs Grid */}
      <ActivePIRsGrid
        pirs={activePIRs}
        loading={loading}
        onPIRClick={handlePIRClick}
      />
    </div>
  )
}

export default Dashboard
