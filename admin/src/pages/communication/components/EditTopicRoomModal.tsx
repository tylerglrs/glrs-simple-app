import { useState, useEffect } from "react"
import {
  db,
  doc,
  updateDoc,
  serverTimestamp,
} from "@/lib/firebase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Hash, Loader2, Save } from "lucide-react"

interface Room {
  id: string
  name: string
  description?: string
  memberCount: number
  lastMessage?: string
  lastMessageAt?: Date
  isActive?: boolean
  createdBy?: string
}

interface EditTopicRoomModalProps {
  open: boolean
  room: Room | null
  onClose: () => void
}

export function EditTopicRoomModal({
  open,
  room,
  onClose,
}: EditTopicRoomModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // Populate form when room changes
  useEffect(() => {
    if (room) {
      setName(room.name)
      setDescription(room.description || "")
      setIsActive(room.isActive !== false)
    }
  }, [room])

  const handleClose = () => {
    setName("")
    setDescription("")
    setIsActive(true)
    onClose()
  }

  const handleSave = async () => {
    if (!room) return

    if (!name.trim()) {
      toast.error("Please enter a room name")
      return
    }

    setSaving(true)
    try {
      await updateDoc(doc(db, "topicRooms", room.id), {
        name: name.trim(),
        description: description.trim(),
        isActive,
        updatedAt: serverTimestamp(),
      })
      toast.success("Topic room updated")
      handleClose()
    } catch (error) {
      console.error("Error updating room:", error)
      toast.error("Failed to update room")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Edit Topic Room
          </DialogTitle>
          <DialogDescription>
            Update the topic room settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name *</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Motivation"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="room-description">Description</Label>
            <Textarea
              id="room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this room about?"
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="room-active" className="cursor-pointer">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "Users can see and post in this room"
                  : "Room is hidden from users"}
              </p>
            </div>
            <Switch
              id="room-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Member Count (Read-only info) */}
          {room && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                Current members: <span className="font-medium">{room.memberCount}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditTopicRoomModal
