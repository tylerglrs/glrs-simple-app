import { useState, useEffect, useMemo, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, FileSignature, Plus, Upload, Send } from "lucide-react"
import { toast } from "sonner"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"

import {
  TemplateCard,
  TemplateFilters,
  EmptyState,
  SkeletonCard,
  TemplateCreateModal,
  TemplateDetailModal,
  DeleteConfirmModal,
  EditorModal,
  UploadDocumentModal,
  UploadedDocumentEditor,
  SendForSignatureModal,
  SendSuccessModal,
  GLRSSigningModal,
  AgreementsView,
} from "./components"
import type { Template, TemplateType, TemplateStatus, SendAgreementResult, Agreement } from "./types"
import { TABS } from "./types"

// ==========================================
// TEMPLATES PAGE
// ==========================================
// Phase 8: Template & Agreement Management
// - Templates tab: Document template management with filtering
// - Agreements tab: E-signature agreement tracking (Phase 11)


export function Templates() {
  const { adminUser } = useAuth()
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id)

  // Template data and loading state
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<TemplateType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<TemplateStatus | "all">("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editorModalOpen, setEditorModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadedEditorOpen, setUploadedEditorOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [sendResult, setSendResult] = useState<SendAgreementResult | null>(null)

  // GLRS signing modal state
  const [glrsSigningModalOpen, setGlrsSigningModalOpen] = useState(false)
  const [selectedAgreementForSigning, setSelectedAgreementForSigning] = useState<Agreement | null>(null)

  // Get current tenant (defaults to "full-service" for admin)
  const tenantId = "full-service"

  // Load templates from Firestore with real-time updates
  useEffect(() => {
    if (!adminUser) return

    setLoading(true)

    const templatesQuery = query(
      collection(db, "templates"),
      where("tenantId", "==", tenantId),
      orderBy("updatedAt", "desc")
    )

    const unsubscribe = onSnapshot(
      templatesQuery,
      (snapshot) => {
        const templateData: Template[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Template[]
        setTemplates(templateData)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading templates:", error)
        toast.error("Failed to load templates")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [adminUser, tenantId])

  // Filter templates based on current filters
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Type filter
      if (filterType !== "all" && template.type !== filterType) {
        return false
      }

      // Status filter
      if (filterStatus !== "all" && template.status !== filterStatus) {
        return false
      }

      // Category filter
      if (filterCategory !== "all" && template.category !== filterCategory) {
        return false
      }

      // Search filter (name and description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = template.name?.toLowerCase().includes(query)
        const matchesDesc = template.description?.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc) {
          return false
        }
      }

      return true
    })
  }, [templates, filterType, filterStatus, filterCategory, searchQuery])

  // Action handlers
  const handleEdit = useCallback((template: Template) => {
    setSelectedTemplate(template)
    setDetailModalOpen(true)
  }, [])

  const handleDuplicate = useCallback(
    async (template: Template) => {
      if (!adminUser) return

      try {
        const { id, createdAt, updatedAt, ...templateData } = template
        await addDoc(collection(db, "templates"), {
          ...templateData,
          name: `${template.name} (Copy)`,
          createdBy: adminUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        toast.success("Template duplicated")
      } catch (error) {
        console.error("Error duplicating template:", error)
        toast.error("Failed to duplicate template")
      }
    },
    [adminUser]
  )

  const handleDelete = useCallback((template: Template) => {
    setSelectedTemplate(template)
    setDeleteModalOpen(true)
  }, [])

  // Actual delete operation (called from DeleteConfirmModal)
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTemplate) return

    await deleteDoc(doc(db, "templates", selectedTemplate.id))
    toast.success("Template deleted")
    setDetailModalOpen(false)
  }, [selectedTemplate])

  const handleSend = useCallback((template: Template) => {
    setSelectedTemplate(template)
    setDetailModalOpen(false)
    setSendModalOpen(true)
  }, [])

  const handleCreateNew = useCallback(() => {
    setCreateModalOpen(true)
  }, [])

  const handleUploadDocument = useCallback(() => {
    setUploadModalOpen(true)
  }, [])

  const handleSendAgreement = useCallback(() => {
    // Open send modal without a pre-selected template
    setSelectedTemplate(null)
    setSendModalOpen(true)
  }, [])

  const handleSendSuccess = useCallback((result: SendAgreementResult) => {
    setSendModalOpen(false)
    setSendResult(result)
    setSuccessModalOpen(true)
  }, [])

  // Handle upload completion - open editor for field placement
  const handleUploadComplete = useCallback((template: Template) => {
    setUploadModalOpen(false)
    setSelectedTemplate(template)
    setUploadedEditorOpen(true)
    toast.success(`"${template.name}" uploaded - add signature fields`)
  }, [])

  // Handle GLRS signing (from agreements tab)
  const handleSignAsGLRS = useCallback((agreement: Agreement) => {
    setSelectedAgreementForSigning(agreement)
    setGlrsSigningModalOpen(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Document Templates</h1>
        <p className="mt-1 text-muted-foreground">
          Create and manage document templates for e-signature
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.id === "templates" ? (
                <FileText className="h-4 w-4" />
              ) : (
                <FileSignature className="h-4 w-4" />
              )}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-0 space-y-6">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSendAgreement}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Agreement
            </Button>
            <Button variant="outline" onClick={handleUploadDocument}>
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>

          {/* Filters */}
          <TemplateFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onTypeChange={setFilterType}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            templates={templates}
          />

          {/* Loading state - skeleton cards */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredTemplates.length === 0 && (
            <EmptyState filterType={filterType} onCreateNew={handleCreateNew} />
          )}

          {/* Template grid */}
          {!loading && filteredTemplates.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onSend={handleSend}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Agreements Tab */}
        <TabsContent value="agreements" className="mt-0">
          <AgreementsView
            user={{
              uid: adminUser?.uid || "",
              email: adminUser?.email || undefined,
              firstName: adminUser?.firstName,
              lastName: adminUser?.lastName,
            }}
            tenantId={tenantId}
            onSendNew={handleSendAgreement}
            onSignAsGLRS={handleSignAsGLRS}
          />
        </TabsContent>
      </Tabs>

      {/* Create Template Modal */}
      <TemplateCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        userId={adminUser?.uid || ""}
        tenantId={tenantId}
        onSuccess={(template) => {
          // Template created, could open editor here in future phase
          toast.info(`Template "${template.name}" created - open editor coming in Phase 4`)
        }}
      />

      {/* Template Detail/Edit Modal */}
      <TemplateDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        template={selectedTemplate}
        onUpdate={() => {
          // Real-time subscription will auto-update the list
        }}
        onDelete={() => {
          // Open delete confirmation modal
          setDeleteModalOpen(true)
        }}
        onOpenEditor={(template) => {
          setSelectedTemplate(template)
          setDetailModalOpen(false)
          // Open appropriate editor based on template type
          if (template.type === "uploaded") {
            setUploadedEditorOpen(true)
          } else {
            setEditorModalOpen(true)
          }
        }}
        onSend={handleSend}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        templateName={selectedTemplate?.name || ""}
        onConfirm={handleConfirmDelete}
      />

      {/* Block Editor Modal */}
      {selectedTemplate && (
        <EditorModal
          template={selectedTemplate}
          open={editorModalOpen}
          onClose={() => setEditorModalOpen(false)}
        />
      )}

      {/* Upload Document Modal */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        userId={adminUser?.uid || ""}
        tenantId={tenantId}
      />

      {/* Uploaded Document Editor (Full-screen) */}
      {selectedTemplate && uploadedEditorOpen && (
        <UploadedDocumentEditor
          template={selectedTemplate}
          onClose={() => setUploadedEditorOpen(false)}
          onSave={() => {
            setUploadedEditorOpen(false)
            toast.success("Template saved")
          }}
        />
      )}

      {/* Send for Signature Modal */}
      <SendForSignatureModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        template={selectedTemplate}
        user={{
          uid: adminUser?.uid || "",
          email: adminUser?.email || undefined,
          firstName: adminUser?.firstName,
          lastName: adminUser?.lastName,
        }}
        tenantId={tenantId}
        onSuccess={handleSendSuccess}
      />

      {/* Send Success Modal */}
      <SendSuccessModal
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false)
          setSendResult(null)
        }}
        result={sendResult}
      />

      {/* GLRS Signing Modal (from Agreements tab) */}
      {selectedAgreementForSigning && (
        <GLRSSigningModal
          open={glrsSigningModalOpen}
          agreement={selectedAgreementForSigning}
          onClose={() => {
            setGlrsSigningModalOpen(false)
            setSelectedAgreementForSigning(null)
          }}
          onComplete={() => {
            setGlrsSigningModalOpen(false)
            setSelectedAgreementForSigning(null)
            toast.success("Document signed successfully")
          }}
          user={{
            uid: adminUser?.uid || "",
            email: adminUser?.email || undefined,
            firstName: adminUser?.firstName,
            lastName: adminUser?.lastName,
          }}
        />
      )}
    </div>
  )
}

export default Templates
