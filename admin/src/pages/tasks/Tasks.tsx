import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  FileText,
  Link,
  LayoutGrid,
  Layers,
  Moon,
  Heart,
  Plus,
  Target,
  Flag,
  ClipboardList,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { CheckInsTab, GoldenThreadTab, OverviewTab } from "./components"
import {
  CreateGoalModal,
  CreateObjectiveModal,
  CreateAssignmentModal,
  CreateGoldenThreadModal,
} from "./components/modals"
import { TabType, CheckInSubTab } from "./types"

// Header content configuration for each main tab
const headerContent: Record<
  TabType,
  { title: string; description: string; icon: LucideIcon }
> = {
  checkins: {
    title: "Check-ins",
    description: "View and manage PIR check-ins, reflections, and gratitude entries",
    icon: FileText,
  },
  goldenthread: {
    title: "Golden Thread",
    description: "Goals, objectives, and assignments hierarchy",
    icon: Link,
  },
  overview: {
    title: "Overview",
    description: "Manage all goals, objectives, and assignments",
    icon: LayoutGrid,
  },
}

// Sub-tab specific descriptions for Check-ins
const checkInSubHeaders: Record<
  CheckInSubTab,
  { subtitle: string; description: string; icon: LucideIcon }
> = {
  all: {
    subtitle: "All Categories",
    description: "All check-in categories across all PIRs",
    icon: Layers,
  },
  evening: {
    subtitle: "Evening Reflections",
    description: "Evening reflections and daily summaries",
    icon: Moon,
  },
  goldenthread: {
    subtitle: "Golden Thread",
    description: "Check-ins tied to assignments and objectives",
    icon: Link,
  },
  gratitude: {
    subtitle: "Gratitude Journal",
    description: "Gratitude journal entries from PIRs",
    icon: Heart,
  },
}

export function Tasks() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("checkins")
  const [activeSubTab, setActiveSubTab] = useState<CheckInSubTab>("all")

  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showObjectiveModal, setShowObjectiveModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showGoldenThreadModal, setShowGoldenThreadModal] = useState(false)

  // Refresh key to trigger data reload in child components
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreated = () => {
    setRefreshKey((k) => k + 1)
  }

  // Get current header content based on tab and sub-tab
  const currentHeader = useMemo(() => {
    const mainHeader = headerContent[activeTab]

    // For check-ins tab, show sub-tab specific content
    if (activeTab === "checkins") {
      const subHeader = checkInSubHeaders[activeSubTab]
      return {
        title: mainHeader.title,
        subtitle: subHeader.subtitle,
        description: subHeader.description,
        Icon: subHeader.icon,
      }
    }

    return {
      title: mainHeader.title,
      subtitle: null,
      description: mainHeader.description,
      Icon: mainHeader.icon,
    }
  }, [activeTab, activeSubTab])

  return (
    <div className="space-y-6">
      {/* Dynamic Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 lg:h-12 lg:w-12">
            <currentHeader.Icon className="h-5 w-5 text-primary lg:h-6 lg:w-6" />
          </div>
          <div className="transition-all duration-200">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                {currentHeader.title}
              </h1>
              {currentHeader.subtitle && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-lg font-medium text-primary lg:text-xl">
                    {currentHeader.subtitle}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-muted-foreground transition-opacity duration-200">
              {currentHeader.description}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Quick Actions - 4 New Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary/50"
              onClick={() => setShowGoalModal(true)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Plus className="h-3 w-3" />
                New Goal
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => setShowObjectiveModal(true)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Flag className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Plus className="h-3 w-3" />
                New Objective
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 hover:bg-amber-50 hover:border-amber-300"
              onClick={() => setShowAssignmentModal(true)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Plus className="h-3 w-3" />
                New Assignment
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 hover:bg-gradient-to-br hover:from-primary/5 hover:to-blue-50 hover:border-primary/50"
              onClick={() => setShowGoldenThreadModal(true)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Plus className="h-3 w-3" />
                Golden Thread
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none">
          <TabsTrigger value="checkins" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Check-ins</span>
          </TabsTrigger>
          <TabsTrigger value="goldenthread" className="gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Golden Thread</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkins" className="mt-6">
          <CheckInsTab
            key={`checkins-${refreshKey}`}
            searchQuery={searchQuery}
            activeSubTab={activeSubTab}
            onSubTabChange={setActiveSubTab}
          />
        </TabsContent>

        <TabsContent value="goldenthread" className="mt-6">
          <GoldenThreadTab key={`goldenthread-${refreshKey}`} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab key={`overview-${refreshKey}`} searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateGoalModal
        open={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onCreated={() => {
          setShowGoalModal(false)
          handleCreated()
        }}
      />

      <CreateObjectiveModal
        open={showObjectiveModal}
        onClose={() => setShowObjectiveModal(false)}
        onCreated={() => {
          setShowObjectiveModal(false)
          handleCreated()
        }}
      />

      <CreateAssignmentModal
        open={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onCreated={() => {
          setShowAssignmentModal(false)
          handleCreated()
        }}
      />

      <CreateGoldenThreadModal
        open={showGoldenThreadModal}
        onClose={() => setShowGoldenThreadModal(false)}
        onCreated={() => {
          setShowGoldenThreadModal(false)
          handleCreated()
        }}
      />
    </div>
  )
}

export default Tasks
