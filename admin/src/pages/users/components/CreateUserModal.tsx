import { useState, useEffect } from "react"
import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, RefreshCw, AlertCircle } from "lucide-react"
import { db, collection, addDoc, serverTimestamp, getDocs, query, where, logAudit, CURRENT_TENANT } from "@/lib/firebase"
import { toast } from "sonner"
import { Coach, UserRole } from "../types"

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  defaultRole?: UserRole
  coaches: Coach[]
}

// Firebase config for secondary app
const firebaseConfig = {
  apiKey: "AIzaSyAufSTHtCTFSEIeZ9YzvrULCnji5I-SMi0",
  authDomain: "glrs-pir-system.firebaseapp.com",
  projectId: "glrs-pir-system",
  storageBucket: "glrs-pir-system.firebasestorage.app",
  messagingSenderId: "830378577655",
  appId: "1:830378577655:web:8c5e0a9b0f3d2f1a0c9e8b",
}

// Capacity limits per tenant
const CAPACITY_LIMITS = {
  "full-service": { pir: 50, coach: 10 },
  consumer: { pir: 500, coach: 5 },
  alumni: { pir: 200, coach: 5 },
}

export function CreateUserModal({
  open,
  onClose,
  onSuccess,
  defaultRole = "pir",
  coaches,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: defaultRole,
    assignedCoach: "",
    phone: "",
    sobrietyDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capacityWarning, setCapacityWarning] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: defaultRole,
        assignedCoach: "",
        phone: "",
        sobrietyDate: "",
      })
      setError("")
      setCapacityWarning("")
    }
  }, [open, defaultRole])

  // Check capacity limits when role changes
  useEffect(() => {
    checkCapacity()
  }, [formData.role])

  const checkCapacity = async () => {
    try {
      const limits = CAPACITY_LIMITS[CURRENT_TENANT as keyof typeof CAPACITY_LIMITS] || CAPACITY_LIMITS["full-service"]
      const roleLimit = formData.role === "coach" ? limits.coach : limits.pir

      const usersSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", formData.role),
          where("active", "==", true)
        )
      )

      const currentCount = usersSnap.size

      if (currentCount >= roleLimit) {
        setCapacityWarning(
          `Warning: You have reached the ${formData.role} capacity limit (${currentCount}/${roleLimit}). Creating this user may exceed your plan limits.`
        )
      } else if (currentCount >= roleLimit * 0.9) {
        setCapacityWarning(
          `Note: You are approaching the ${formData.role} capacity limit (${currentCount}/${roleLimit}).`
        )
      } else {
        setCapacityWarning("")
      }
    } catch (err) {
      console.error("Error checking capacity:", err)
    }
  }

  const generatePassword = () => {
    const first = formData.firstName.charAt(0).toUpperCase() || "U"
    const last = formData.lastName.charAt(0).toUpperCase() || "S"
    const random = Math.floor(1000 + Math.random() * 9000)
    const special = "!@#$%"[Math.floor(Math.random() * 5)]
    const password = `${first}${last}${random}${special}`
    setFormData((prev) => ({ ...prev, password }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        throw new Error("Please fill in all required fields")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      // Validate password length
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      // For PIRs, require assigned coach
      if (formData.role === "pir" && !formData.assignedCoach) {
        throw new Error("Please assign a coach to this PIR")
      }

      // Check if email already exists
      const existingUser = await getDocs(
        query(collection(db, "users"), where("email", "==", formData.email.toLowerCase()))
      )
      if (!existingUser.empty) {
        throw new Error("A user with this email already exists")
      }

      // Create secondary Firebase app for user creation
      const secondaryAppName = `secondary-${Date.now()}`
      let secondaryApp = null

      try {
        secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
        const secondaryAuth = getAuth(secondaryApp)

        // Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.email,
          formData.password
        )

        const newUserId = userCredential.user.uid

        // Create user document in Firestore
        const userData: Record<string, unknown> = {
          uid: newUserId,
          email: formData.email.toLowerCase(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`,
          role: formData.role,
          tenantId: CURRENT_TENANT,
          active: true,
          createdAt: serverTimestamp(),
          lastLogin: null,
          phone: formData.phone || null,
        }

        // Add PIR-specific fields
        if (formData.role === "pir") {
          userData.assignedCoach = formData.assignedCoach
          userData.sobrietyDate = formData.sobrietyDate || null
          userData.checkInStreak = 0
          userData.compliance = 100
          userData.complianceLevel = "high"
        }

        // Add coach-specific fields
        if (formData.role === "coach") {
          userData.pirCount = 0
          userData.capacity = 15 // Default capacity
        }

        // Save to users collection with the auth UID as document ID
        await addDoc(collection(db, "users"), {
          ...userData,
          id: newUserId,
        })

        // Log audit
        await logAudit("user_created", {
          targetUserId: newUserId,
          resource: "users",
          resourceId: newUserId,
          changes: {
            email: formData.email,
            role: formData.role,
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        })

        toast.success(`${formData.role.toUpperCase()} created successfully`)
        onSuccess()
        onClose()
      } finally {
        // Always clean up the secondary app
        if (secondaryApp) {
          await deleteApp(secondaryApp)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const availableCoaches = coaches.filter((c) => {
    if (!c.capacity) return true
    return (c.pirCount || 0) < c.capacity
  })

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {capacityWarning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{capacityWarning}</AlertDescription>
            </Alert>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as UserRole }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pir">PIR (Person in Recovery)</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="john.doe@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generate password">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click the refresh button to auto-generate a password
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </div>

          {/* PIR-specific fields */}
          {formData.role === "pir" && (
            <>
              {/* Assigned Coach */}
              <div className="space-y-2">
                <Label htmlFor="assignedCoach">Assigned Coach *</Label>
                <Select
                  value={formData.assignedCoach}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedCoach: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCoaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.displayName || `${coach.firstName} ${coach.lastName}`}
                        {coach.capacity && (
                          <span className="ml-2 text-muted-foreground">
                            ({coach.pirCount || 0}/{coach.capacity})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableCoaches.length === 0 && (
                  <p className="text-sm text-destructive">
                    No coaches available. All coaches are at capacity.
                  </p>
                )}
              </div>

              {/* Sobriety Date */}
              <div className="space-y-2">
                <Label htmlFor="sobrietyDate">Sobriety Date</Label>
                <Input
                  id="sobrietyDate"
                  type="date"
                  value={formData.sobrietyDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sobrietyDate: e.target.value }))}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
