import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  Grid,
  List,
  BookOpen,
  Video,
  FileText,
  Link as LinkIcon,
  Eye,
  Trash2,
  ExternalLink,
  Users,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

const CURRENT_TENANT = "full-service"

interface Resource {
  id: string
  title: string
  description?: string
  type: "article" | "video" | "document" | "link" | "guide"
  category: string
  url?: string
  content?: string
  status: "active" | "draft" | "archived"
  assignedTo?: string[]
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
  tenantId: string
  viewCount?: number
}

const RESOURCE_TYPES = [
  { value: "article", label: "Article", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "document", label: "Document", icon: FileText },
  { value: "link", label: "External Link", icon: LinkIcon },
  { value: "guide", label: "Guide", icon: BookOpen },
]

const CATEGORIES = [
  "Recovery Basics",
  "Coping Skills",
  "Mental Health",
  "Physical Health",
  "Relationships",
  "Career & Finance",
  "Spirituality",
  "Relapse Prevention",
  "Daily Living",
  "Other",
]

function getTypeIcon(type: string) {
  const typeConfig = RESOURCE_TYPES.find((t) => t.value === type)
  const Icon = typeConfig?.icon || FileText
  return <Icon className="h-5 w-5" />
}

function getTypeBadge(type: string) {
  const colors: Record<string, string> = {
    article: "bg-blue-100 text-blue-700",
    video: "bg-purple-100 text-purple-700",
    document: "bg-amber-100 text-amber-700",
    link: "bg-emerald-100 text-emerald-700",
    guide: "bg-primary/10 text-primary",
  }
  return (
    <Badge variant="secondary" className={colors[type] || "bg-gray-100 text-gray-600"}>
      {type}
    </Badge>
  )
}

export function Guides() {
  useAuth() // Verify authentication

  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)

  const loadResources = useCallback(async () => {
    setLoading(true)
    try {
      const resourcesSnap = await getDocs(
        query(
          collection(db, "resources"),
          where("tenantId", "==", CURRENT_TENANT),
          orderBy("createdAt", "desc")
        )
      )

      const resourcesData: Resource[] = []
      resourcesSnap.forEach((docSnap) => {
        const data = docSnap.data()
        resourcesData.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          type: data.type || "article",
          category: data.category || "Other",
          url: data.url,
          content: data.content,
          status: data.status || "active",
          assignedTo: data.assignedTo || [],
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          createdBy: data.createdBy,
          tenantId: data.tenantId,
          viewCount: data.viewCount || 0,
        })
      })
      setResources(resourcesData)
    } catch (error) {
      console.error("Error loading resources:", error)
      toast.error("Failed to load resources")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const filteredResources = useMemo(() => {
    let filtered = resources

    if (filterType !== "all") {
      filtered = filtered.filter((r) => r.type === filterType)
    }
    if (filterCategory !== "all") {
      filtered = filtered.filter((r) => r.category === filterCategory)
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [resources, filterType, filterCategory, filterStatus, searchQuery])

  const handleDeleteResource = async () => {
    if (!resourceToDelete) return
    try {
      await deleteDoc(doc(db, "resources", resourceToDelete.id))
      toast.success("Resource deleted")
      loadResources()
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Failed to delete resource")
    } finally {
      setResourceToDelete(null)
    }
  }

  // Get unique categories from data
  const categories = useMemo(() => {
    const cats = new Set(resources.map((r) => r.category))
    return Array.from(cats).sort()
  }, [resources])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-3 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Guides & Resources</h1>
          <p className="mt-1 text-muted-foreground">
            Manage educational content and resources for PIRs
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RESOURCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary">
                    {getTypeIcon(resource.type)}
                    {getTypeBadge(resource.type)}
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      resource.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : resource.status === "draft"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {resource.status}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {resource.description || "No description"}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{resource.category}</span>
                  {resource.assignedTo && resource.assignedTo.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {resource.assignedTo.length}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedResource(resource)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View
                </Button>
                {resource.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(resource.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setResourceToDelete(resource)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {getTypeIcon(resource.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium">{resource.title}</h3>
                    {getTypeBadge(resource.type)}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {resource.category} | {formatDate(resource.createdAt, "relative")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedResource(resource)}>
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setResourceToDelete(resource)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="mb-4 h-12 w-12 opacity-30" />
            <p>No resources found</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setFilterType("all")
                setFilterCategory("all")
                setFilterStatus("all")
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <CreateResourceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          loadResources()
        }}
      />

      {/* Detail Modal */}
      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
            <DialogDescription>Resource Details</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeBadge(selectedResource.type)}
                <Badge
                  variant="secondary"
                  className={
                    selectedResource.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }
                >
                  {selectedResource.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedResource.category}
                </span>
              </div>

              {selectedResource.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedResource.description}</p>
                </div>
              )}

              {selectedResource.url && (
                <div>
                  <Label className="text-muted-foreground">URL</Label>
                  <a
                    href={selectedResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-primary hover:underline"
                  >
                    {selectedResource.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {selectedResource.content && (
                <div>
                  <Label className="text-muted-foreground">Content</Label>
                  <div className="mt-1 rounded-lg bg-muted p-3 text-sm">
                    {selectedResource.content}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Created {formatDate(selectedResource.createdAt, "long")}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedResource(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resourceToDelete?.title}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Create Resource Modal
interface CreateResourceModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateResourceModal({ open, onClose, onSuccess }: CreateResourceModalProps) {
  const { adminUser } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "article",
    category: "Recovery Basics",
    url: "",
    content: "",
    status: "active",
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error("Please enter a title")
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, "resources"), {
        ...formData,
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
        viewCount: 0,
        assignedTo: [],
      })
      toast.success("Resource created")
      onSuccess()
      setFormData({
        title: "",
        description: "",
        type: "article",
        category: "Recovery Basics",
        url: "",
        content: "",
        status: "active",
      })
    } catch (error) {
      console.error("Error creating resource:", error)
      toast.error("Failed to create resource")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>Create a new educational resource for PIRs</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Resource title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (optional)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              placeholder="Full content or notes"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Guides
