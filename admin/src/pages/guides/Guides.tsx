import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  storage,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
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
import { GuidesSkeleton } from "@/components/common"
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
  Upload,
  Loader2,
  X,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toDate } from "@/lib/timestamp"

const CURRENT_TENANT = "full-service"

// =============================================================================
// RESOURCE INTERFACE - Unified schema for Admin and PIR Portal
// =============================================================================
// IMPORTANT: This interface must stay in sync with /Index/pir-portal/src/types/firebase.ts
// Key compatibility notes:
// - Admin uses `status` ('active'/'draft'/'archived') AND `isPublished` (boolean)
// - PIR Portal reads `isPublished` to determine visibility
// - When status = 'active', isPublished = true; otherwise isPublished = false

interface Resource {
  id: string
  title: string
  description?: string
  type: "article" | "video" | "pdf" | "link" | "audio" // Aligned with PIR Portal
  category: string
  url?: string
  content?: string
  status: "active" | "draft" | "archived" // Admin Portal status management
  isPublished: boolean // PIR Portal visibility flag (derived from status)
  assignedTo?: string[]
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
  tenantId: string
  viewCount?: number
  // Additional PIR Portal fields
  subcategory?: string
  thumbnailUrl?: string
  author?: string
  duration?: number
  tags?: string[]
}

// =============================================================================
// RESOURCE TYPES - Aligned with PIR Portal
// =============================================================================
// IMPORTANT: Types must match /Index/pir-portal/src/types/firebase.ts
const RESOURCE_TYPES = [
  { value: "article", label: "Article", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "pdf", label: "PDF Document", icon: FileText },
  { value: "link", label: "External Link", icon: LinkIcon },
  { value: "audio", label: "Audio", icon: BookOpen },
]

// =============================================================================
// RESOURCE CATEGORIES - Synced with PIR Portal (6 categories)
// =============================================================================
// IMPORTANT: These categories must match /Index/pir-portal/src/features/resources/hooks/useResources.ts
// Any changes here MUST be reflected in the PIR Portal as well.

interface ResourceCategoryConfig {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

const RESOURCE_CATEGORIES: ResourceCategoryConfig[] = [
  {
    id: 'coping',
    name: 'Coping Skills',
    icon: 'Brain',
    color: 'emerald',
    description: 'Tools and techniques for managing stress and difficult emotions',
  },
  {
    id: 'relapse',
    name: 'Relapse Prevention',
    icon: 'Shield',
    color: 'amber',
    description: 'Strategies to recognize and avoid triggers',
  },
  {
    id: 'daily',
    name: 'Daily Tools',
    icon: 'CalendarCheck',
    color: 'blue',
    description: 'Resources for your daily recovery routine',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'BookOpen',
    color: 'purple',
    description: 'Learn about addiction, recovery, and mental health',
  },
  {
    id: 'support',
    name: 'Support',
    icon: 'Users',
    color: 'teal',
    description: 'Connect with support systems and community',
  },
  {
    id: 'life',
    name: 'Life Skills',
    icon: 'Sparkles',
    color: 'rose',
    description: 'Financial, career, and personal development resources',
  },
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
        const status = data.status || "active"
        // Derive isPublished from status if not explicitly set
        const isPublished = data.isPublished !== undefined
          ? data.isPublished
          : status === "active"
        resourcesData.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          type: data.type || "article",
          category: data.category || "coping", // Default to coping instead of Other
          url: data.url,
          content: data.content,
          status,
          isPublished,
          assignedTo: data.assignedTo || [],
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          createdBy: data.createdBy,
          tenantId: data.tenantId,
          viewCount: data.viewCount || 0,
          // Additional PIR Portal fields
          subcategory: data.subcategory,
          thumbnailUrl: data.thumbnailUrl,
          author: data.author,
          duration: data.duration,
          tags: data.tags,
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

  // Helper to get category name from ID for display
  const getCategoryName = useCallback((categoryId: string) => {
    const cat = RESOURCE_CATEGORIES.find(c => c.id === categoryId)
    return cat?.name || categoryId
  }, [])

  if (loading) {
    return <GuidesSkeleton />
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
              {RESOURCE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
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
                  <span>{getCategoryName(resource.category)}</span>
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
                    {getCategoryName(resource.category)} | {formatDate(resource.createdAt, "relative")}
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
                  {getCategoryName(selectedResource.category)}
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
    category: "coping",
    url: "",
    content: "",
    status: "active",
  })
  const [saving, setSaving] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        setPdfFile(file)
        // Auto-fill title from filename if empty
        if (!formData.title) {
          const nameWithoutExt = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")
          setFormData((p) => ({ ...p, title: nameWithoutExt }))
        }
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        setPdfFile(file)
        // Auto-fill title from filename if empty
        if (!formData.title) {
          const nameWithoutExt = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")
          setFormData((p) => ({ ...p, title: nameWithoutExt }))
        }
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const uploadPdfToStorage = async (file: File): Promise<string> => {
    // Create a safe filename: category-title.pdf
    const safeTitle = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const filename = `${formData.category}-${safeTitle}.pdf`
    const storageRef = ref(storage, `resources/pdfs/${filename}`)

    setUploading(true)
    setUploadProgress(10)

    try {
      // Upload file
      setUploadProgress(30)
      await uploadBytes(storageRef, file)
      setUploadProgress(70)

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef)
      setUploadProgress(100)

      return downloadUrl
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error("Please enter a title")
      return
    }

    // Require PDF file if type is pdf
    if (formData.type === "pdf" && !pdfFile && !formData.url) {
      toast.error("Please upload a PDF file or provide a URL")
      return
    }

    setSaving(true)
    try {
      let finalUrl = formData.url

      // Upload PDF if file selected and type is pdf
      if (formData.type === "pdf" && pdfFile) {
        toast.info("Uploading PDF...")
        finalUrl = await uploadPdfToStorage(pdfFile)
        toast.success("PDF uploaded successfully")
      }

      // Determine isPublished from status for PIR Portal compatibility
      const isPublished = formData.status === "active"

      await addDoc(collection(db, "resources"), {
        ...formData,
        url: finalUrl,
        isPublished,
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
        viewCount: 0,
        assignedTo: [],
      })
      toast.success("Resource created")
      onSuccess()
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "article",
        category: "coping",
        url: "",
        content: "",
        status: "active",
      })
      setPdfFile(null)
      setUploadProgress(0)
    } catch (error) {
      console.error("Error creating resource:", error)
      toast.error("Failed to create resource")
    } finally {
      setSaving(false)
    }
  }

  const isPdfType = formData.type === "pdf"

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
                onValueChange={(v) => {
                  setFormData((p) => ({ ...p, type: v }))
                  // Clear PDF file if switching away from PDF type
                  if (v !== "pdf") {
                    setPdfFile(null)
                  }
                }}
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
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PDF Upload Section - Only shown when type is PDF */}
          {isPdfType && (
            <div className="space-y-2">
              <Label>Upload PDF File</Label>
              <div
                className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : pdfFile
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-medium text-emerald-700">{pdfFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => setPdfFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop a PDF file here, or{" "}
                      <label className="cursor-pointer text-primary hover:underline">
                        browse
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">PDF files only</p>
                  </>
                )}

                {/* Upload progress bar */}
                {uploading && (
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="url">
              {isPdfType ? "URL (optional - will be auto-filled after upload)" : "URL (optional)"}
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://..."
              disabled={isPdfType && !!pdfFile}
            />
            {isPdfType && (
              <p className="text-xs text-muted-foreground">
                Upload a PDF file above, or paste an existing URL
              </p>
            )}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={saving || uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : saving ? (
                "Creating..."
              ) : (
                "Create Resource"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Guides
