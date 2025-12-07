import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Globe, ClipboardCheck } from "lucide-react"
import { GLRSMeetingsTab, ExternalMeetingsTab, AttendanceTab } from "./components"

export function Meetings() {
  const [activeTab, setActiveTab] = useState("glrs")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Meetings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage GLRS meetings and browse external AA/NA meetings
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="glrs" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">GLRS Meetings</span>
            <span className="sm:hidden">GLRS</span>
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">AA/NA Meetings</span>
            <span className="sm:hidden">AA/NA</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
            <span className="sm:hidden">Attend</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="glrs" className="mt-6">
          <GLRSMeetingsTab />
        </TabsContent>

        <TabsContent value="external" className="mt-6">
          <ExternalMeetingsTab />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Meetings
