import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, User, Download } from "lucide-react"
import { AttendanceByMeeting } from "./AttendanceByMeeting"
import { AttendanceByPIR } from "./AttendanceByPIR"

type SubTab = "by-meeting" | "by-pir"

export function AttendanceTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("by-meeting")

  const handleExport = () => {
    // Export will be triggered from child components
    // This button dispatches a custom event that children listen to
    window.dispatchEvent(new CustomEvent("export-attendance", { detail: activeSubTab }))
  }

  return (
    <div className="space-y-4">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attendance Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Record and view meeting attendance
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as SubTab)}>
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="by-meeting" className="gap-2">
            <Calendar className="h-4 w-4" />
            By Meeting
          </TabsTrigger>
          <TabsTrigger value="by-pir" className="gap-2">
            <User className="h-4 w-4" />
            By PIR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-meeting" className="mt-4">
          <AttendanceByMeeting />
        </TabsContent>

        <TabsContent value="by-pir" className="mt-4">
          <AttendanceByPIR />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AttendanceTab
