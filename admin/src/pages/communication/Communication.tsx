import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Users,
  UsersRound,
  Hash,
  Send,
  Plus,
  Search,
  Shield,
  Megaphone,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDate, getInitials } from "@/lib/utils"
import { SupportGroupsTab } from "./components/SupportGroupsTab"
import { ModerationTab } from "./components/ModerationTab"
import { BroadcastModal } from "./components/BroadcastModal"
import { EditTopicRoomModal } from "./components/EditTopicRoomModal"

interface Message {
  id: string
  content: string
  senderId: string
  senderName?: string
  recipientId?: string
  recipientName?: string
  roomId?: string
  createdAt?: Date
  type: "direct" | "room" | "broadcast"
}

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

interface PIRUser {
  id: string
  displayName?: string
  email: string
}

export function Communication() {
  const { adminUser, getDataScope } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [pirUsers, setPirUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("direct")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPIR, setSelectedPIR] = useState<string | null>(null)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [showNewRoom, setShowNewRoom] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load PIR users (static - doesn't need real-time)
  useEffect(() => {
    const loadPIRs = async () => {
      if (!adminUser) return
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
        const users: PIRUser[] = []
        usersSnap.forEach((docSnap) => {
          const data = docSnap.data()
          users.push({
            id: docSnap.id,
            displayName: data.displayName,
            email: data.email,
          })
        })
        setPirUsers(users)
      } catch (error) {
        console.error("Error loading PIRs:", error)
      }
    }

    loadPIRs()
  }, [adminUser, getDataScope])

  // Real-time listener for messages
  useEffect(() => {
    if (!adminUser) return

    const unsubscribe = onSnapshot(
      query(
        collection(db, "messages"),
        where("tenantId", "==", CURRENT_TENANT),
        orderBy("createdAt", "desc"),
        limit(100)
      ),
      (snapshot) => {
        const msgs: Message[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          msgs.push({
            id: docSnap.id,
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            recipientId: data.recipientId,
            recipientName: data.recipientName,
            roomId: data.roomId,
            createdAt: data.createdAt?.toDate?.(),
            type: data.type || "direct",
          })
        })
        setMessages(msgs)
        setLoading(false)
      },
      (error) => {
        console.error("Error listening to messages:", error)
        toast.error("Failed to load messages")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [adminUser])

  // Real-time listener for topic rooms
  useEffect(() => {
    if (!adminUser) return

    const unsubscribe = onSnapshot(
      query(
        collection(db, "topicRooms"),
        where("tenantId", "==", CURRENT_TENANT)
      ),
      (snapshot) => {
        const roomsList: Room[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          roomsList.push({
            id: docSnap.id,
            name: data.name,
            description: data.description,
            memberCount: data.members?.length || 0,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt?.toDate?.(),
            isActive: data.isActive !== false,
            createdBy: data.createdBy,
          })
        })
        setRooms(roomsList)
      },
      (error) => {
        console.error("Error listening to rooms:", error)
      }
    )

    return () => unsubscribe()
  }, [adminUser])

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, "topicRooms", deletingRoom.id))
      toast.success("Topic room deleted")
      setDeletingRoom(null)
    } catch (error) {
      console.error("Error deleting room:", error)
      toast.error("Failed to delete room")
    } finally {
      setDeleting(false)
    }
  }

  const directMessages = useMemo(() => {
    return messages.filter((m) => m.type === "direct")
  }, [messages])

  const filteredPIRs = useMemo(() => {
    if (!searchQuery) return pirUsers
    const q = searchQuery.toLowerCase()
    return pirUsers.filter(
      (p) =>
        p.displayName?.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    )
  }, [pirUsers, searchQuery])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[500px]" />
          <Skeleton className="col-span-2 h-[500px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Communication</h1>
          <p className="mt-1 text-muted-foreground">
            Message PIRs, manage topic rooms, support groups, and moderation
          </p>
        </div>
        {activeTab !== "groups" && activeTab !== "moderation" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBroadcast(true)}>
              <Megaphone className="mr-2 h-4 w-4" />
              Broadcast
            </Button>
            <Button variant="outline" onClick={() => setShowNewRoom(true)}>
              <Hash className="mr-2 h-4 w-4" />
              New Room
            </Button>
            <Button onClick={() => setShowNewMessage(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        )}
      </div>

      {/* Top-level Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="direct" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Direct Messages
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <Hash className="h-4 w-4" />
            Topic Rooms
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <UsersRound className="h-4 w-4" />
            Support Groups
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-2">
            <Shield className="h-4 w-4" />
            Moderation
          </TabsTrigger>
        </TabsList>

        {/* Direct Messages Tab */}
        <TabsContent value="direct" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sidebar - PIR List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search PIRs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y">
                    {filteredPIRs.map((pir) => (
                      <button
                        key={pir.id}
                        onClick={() => setSelectedPIR(pir.id)}
                        className={`flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 ${
                          selectedPIR === pir.id ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(pir.displayName || pir.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {pir.displayName || pir.email}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {pir.email}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <ScrollArea className="h-[400px]">
                  {directMessages.length > 0 ? (
                    <div className="space-y-3">
                      {directMessages.map((msg) => (
                        <div key={msg.id} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(msg.senderName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{msg.senderName}</span>
                                <span className="text-muted-foreground"> to </span>
                                <span className="font-medium">{msg.recipientName}</span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(msg.createdAt, "relative")}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <MessageSquare className="mb-4 h-12 w-12 opacity-30" />
                      <p>No messages yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Topic Rooms Tab */}
        <TabsContent value="rooms" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Hash className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{room.name}</span>
                          {room.isActive === false && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {room.description || "No description"}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <Users className="mr-1 h-3 w-3" />
                        {room.memberCount}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Room
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingRoom(room)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Hash className="mb-4 h-12 w-12 opacity-30" />
                    <p>No topic rooms yet</p>
                    <Button variant="link" onClick={() => setShowNewRoom(true)}>
                      Create one
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Groups Tab */}
        <TabsContent value="groups" className="mt-0">
          <SupportGroupsTab />
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="mt-0">
          <ModerationTab />
        </TabsContent>
      </Tabs>

      {/* New Message Modal */}
      <NewMessageModal
        open={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        pirUsers={pirUsers}
      />

      {/* New Room Modal */}
      <NewRoomModal
        open={showNewRoom}
        onClose={() => setShowNewRoom(false)}
      />

      {/* Broadcast Modal */}
      <BroadcastModal
        open={showBroadcast}
        onClose={() => setShowBroadcast(false)}
      />

      {/* Edit Topic Room Modal */}
      <EditTopicRoomModal
        open={!!editingRoom}
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
      />

      {/* Delete Room Confirmation */}
      <AlertDialog open={!!deletingRoom} onOpenChange={(open) => !open && setDeletingRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingRoom?.name}</strong>?
              This action cannot be undone and all messages in this room will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Room"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// New Message Modal
function NewMessageModal({
  open,
  onClose,
  pirUsers,
}: {
  open: boolean
  onClose: () => void
  pirUsers: PIRUser[]
}) {
  const { adminUser } = useAuth()
  const [recipientId, setRecipientId] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!recipientId || !content.trim()) {
      toast.error("Please select a recipient and enter a message")
      return
    }

    setSending(true)
    try {
      const recipient = pirUsers.find((p) => p.id === recipientId)
      await addDoc(collection(db, "messages"), {
        content: content.trim(),
        senderId: adminUser?.uid,
        senderName: adminUser?.displayName || adminUser?.email,
        recipientId,
        recipientName: recipient?.displayName || recipient?.email,
        type: "direct",
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })
      toast.success("Message sent")
      onClose()
      setContent("")
      setRecipientId("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Send a direct message to a PIR</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select PIR" />
              </SelectTrigger>
              <SelectContent>
                {pirUsers.map((pir) => (
                  <SelectItem key={pir.id} value={pir.id}>
                    {pir.displayName || pir.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// New Room Modal
function NewRoomModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { adminUser } = useAuth()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a room name")
      return
    }

    setCreating(true)
    try {
      await addDoc(collection(db, "topicRooms"), {
        name: name.trim(),
        description: description.trim(),
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
        members: [],
        isActive: true,
      })
      toast.success("Room created")
      onClose()
      setName("")
      setDescription("")
    } catch (error) {
      console.error("Error creating room:", error)
      toast.error("Failed to create room")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Topic Room</DialogTitle>
          <DialogDescription>Create a new discussion room for PIRs</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Room Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Motivation"
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this room about?"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            <Plus className="mr-2 h-4 w-4" />
            {creating ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Communication
