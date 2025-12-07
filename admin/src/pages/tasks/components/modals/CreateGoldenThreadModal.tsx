import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Loader2,
  Target,
  Flag,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { PIRUser, Priority } from "../../types"

const CURRENT_TENANT = "full-service"

const STEPS = [
  { id: 1, title: "Select PIR", icon: User },
  { id: 2, title: "Create Goal", icon: Target },
  { id: 3, title: "Create Objective", icon: Flag },
  { id: 4, title: "Create Assignment", icon: ClipboardList },
  { id: 5, title: "Review", icon: Check },
]

interface CreateGoldenThreadModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateGoldenThreadModal({
  open,
  onClose,
  onCreated,
}: CreateGoldenThreadModalProps) {
  const { adminUser, getDataScope } = useAuth()

  const [users, setUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Form data
  const [pirId, setPirId] = useState("")
  const [goalTitle, setGoalTitle] = useState("")
  const [goalDescription, setGoalDescription] = useState("")
  const [objectiveTitle, setObjectiveTitle] = useState("")
  const [objectiveDescription, setObjectiveDescription] = useState("")
  const [assignmentTitle, setAssignmentTitle] = useState("")
  const [assignmentDescription, setAssignmentDescription] = useState("")
  const [assignmentDueDate, setAssignmentDueDate] = useState("")
  const [assignmentPriority, setAssignmentPriority] = useState<Priority>("medium")

  // Load PIRs when modal opens
  useEffect(() => {
    if (open && users.length === 0) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    if (!adminUser) return

    setLoading(true)
    const scope = getDataScope()

    try {
      let pirQuery = query(
        collection(db, "users"),
        where("tenantId", "==", CURRENT_TENANT),
        where("role", "==", "pir")
      )

      if (scope === "assigned_pirs" && adminUser.uid) {
        pirQuery = query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir"),
          where("assignedCoach", "==", adminUser.uid)
        )
      }

      const usersSnap = await getDocs(pirQuery)
      const usersData: PIRUser[] = []

      usersSnap.forEach((docSnap) => {
        const data = docSnap.data()
        usersData.push({
          id: docSnap.id,
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
        })
      })
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load PIRs")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setPirId("")
    setGoalTitle("")
    setGoalDescription("")
    setObjectiveTitle("")
    setObjectiveDescription("")
    setAssignmentTitle("")
    setAssignmentDescription("")
    setAssignmentDueDate("")
    setAssignmentPriority("medium")
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!pirId
      case 2:
        return !!goalTitle
      case 3:
        return !!objectiveTitle
      case 4:
        return !!assignmentTitle
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleSubmit = async () => {
    if (!pirId || !goalTitle || !objectiveTitle || !assignmentTitle) {
      toast.error("Please complete all required fields")
      return
    }

    setSaving(true)
    try {
      // Step 1: Create Goal
      const goalDoc = await addDoc(collection(db, "goals"), {
        title: goalTitle,
        description: goalDescription,
        pirId,
        userId: pirId, // PIR app queries by userId
        status: "active",
        progress: 0, // Initial progress
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      // Step 2: Create Objective in TOP-LEVEL objectives collection (PIR app queries this)
      const objectiveDoc = await addDoc(collection(db, "objectives"), {
        title: objectiveTitle,
        description: objectiveDescription,
        goalId: goalDoc.id, // Link to parent goal
        pirId,
        userId: pirId, // PIR app queries by userId
        status: "active",
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      // Step 3: Create Assignment linked to Objective
      await addDoc(collection(db, "assignments"), {
        title: assignmentTitle,
        description: assignmentDescription,
        pirId,
        userId: pirId, // PIR app queries by userId
        goalId: goalDoc.id,
        objectiveId: objectiveDoc.id,
        priority: assignmentPriority,
        dueDate: assignmentDueDate
          ? Timestamp.fromDate(new Date(assignmentDueDate))
          : null,
        status: "pending",
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      toast.success("Golden Thread created successfully!")
      resetForm()
      onCreated()
    } catch (error) {
      console.error("Error creating Golden Thread:", error)
      toast.error("Failed to create Golden Thread")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedUser = users.find((u) => u.id === pirId)
  const progress = (currentStep / STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create Golden Thread</DialogTitle>
              <DialogDescription>
                Create a complete hierarchy: Goal, Objective, and Assignment
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const StepIcon = step.icon
              const isActive = step.id === currentStep
              const isComplete = step.id < currentStep

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-colors",
                    isActive && "text-primary",
                    isComplete && "text-emerald-600",
                    !isActive && !isComplete && "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      isActive && "border-primary bg-primary/10",
                      isComplete && "border-emerald-600 bg-emerald-50",
                      !isActive && !isComplete && "border-muted"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block">
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[280px] py-4">
          {/* Step 1: Select PIR */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Select a PIR</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the Person in Recovery for this Golden Thread
                </p>
              </div>
              <div className="space-y-2">
                <Label>Person in Recovery *</Label>
                <Select value={pirId} onValueChange={setPirId} disabled={loading}>
                  <SelectTrigger className="h-12">
                    <SelectValue
                      placeholder={loading ? "Loading PIRs..." : "Select PIR"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(u.displayName || u.email)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{u.displayName || u.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Create Goal */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-primary mb-2">
                  <Target className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Create Goal</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define the main goal for {selectedUser?.displayName || selectedUser?.email}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Goal Title *</Label>
                <Input
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g., Maintain 90 days of sobriety"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Describe what success looks like..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Create Objective */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-blue-600 mb-2">
                  <Flag className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Create Objective</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define an objective under "{goalTitle}"
                </p>
              </div>
              <div className="space-y-2">
                <Label>Objective Title *</Label>
                <Input
                  value={objectiveTitle}
                  onChange={(e) => setObjectiveTitle(e.target.value)}
                  placeholder="e.g., Complete weekly therapy sessions"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={objectiveDescription}
                  onChange={(e) => setObjectiveDescription(e.target.value)}
                  placeholder="Describe the objective..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Create Assignment */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-amber-600 mb-2">
                  <ClipboardList className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Create Assignment</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define an assignment under "{objectiveTitle}"
                </p>
              </div>
              <div className="space-y-2">
                <Label>Assignment Title *</Label>
                <Input
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g., Complete daily journal entry"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  placeholder="Describe what needs to be done..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={assignmentPriority}
                    onValueChange={(v) => setAssignmentPriority(v as Priority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-emerald-600 mb-2">
                  <Check className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Review & Create</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review your Golden Thread before creating
                </p>
              </div>

              <div className="space-y-3">
                {/* PIR */}
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(selectedUser?.displayName || selectedUser?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">PIR</p>
                    <p className="font-medium">
                      {selectedUser?.displayName || selectedUser?.email}
                    </p>
                  </div>
                </div>

                {/* Goal */}
                <div className="flex items-start gap-3 rounded-lg border p-3 bg-primary/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="font-medium">{goalTitle}</p>
                    {goalDescription && (
                      <p className="text-sm text-muted-foreground mt-1">{goalDescription}</p>
                    )}
                  </div>
                </div>

                {/* Objective */}
                <div className="ml-6 flex items-start gap-3 rounded-lg border p-3 bg-blue-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Flag className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Objective</p>
                    <p className="font-medium">{objectiveTitle}</p>
                  </div>
                </div>

                {/* Assignment */}
                <div className="ml-12 flex items-start gap-3 rounded-lg border p-3 bg-amber-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <ClipboardList className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Assignment</p>
                    <p className="font-medium">{assignmentTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          assignmentPriority === "high" && "bg-red-100 text-red-700",
                          assignmentPriority === "medium" && "bg-amber-100 text-amber-700",
                          assignmentPriority === "low" && "bg-gray-100 text-gray-600"
                        )}
                      >
                        {assignmentPriority}
                      </Badge>
                      {assignmentDueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(assignmentDueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={saving}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          {currentStep === 1 && (
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
          )}
          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving} className="gap-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Golden Thread
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGoldenThreadModal
