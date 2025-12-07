import { useState, useEffect, useCallback, useRef } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Eye,
  Edit,
  Save,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { db, doc, updateDoc, serverTimestamp } from "@/lib/firebase"
import { EditorLayout } from "./EditorLayout"
import { getBlockDefinition } from "../../constants"
import type { Template, Block, BlockType, TemplateStatus, TemplateComponents } from "../../types"
import { cn } from "@/lib/utils"

type SaveStatus = "saved" | "saving" | "unsaved"

interface EditorModalProps {
  template: Template
  open: boolean
  onClose: () => void
}

/**
 * EditorModal - Full-screen editor modal
 * Ported from templates.html lines 3497-4512
 */
export function EditorModal({ template, open, onClose }: EditorModalProps) {
  // Core state
  const [blocks, setBlocks] = useState<Block[]>(
    template?.content?.blocks || []
  )
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState(
    template?.name || "Untitled Template"
  )

  // Document properties state
  const [templateDescription, setTemplateDescription] = useState(
    template?.description || ""
  )
  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>(
    template?.status || "draft"
  )
  const [templateCategory, setTemplateCategory] = useState(
    template?.category || "other"
  )
  const [components, setComponents] = useState<TemplateComponents>(
    template?.components || {}
  )

  // UI state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [previewMode, setPreviewMode] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Initialize from template
  useEffect(() => {
    if (template?.content?.blocks) {
      setBlocks(template.content.blocks)
    }
    setTemplateName(template?.name || "Untitled Template")
    setTemplateDescription(template?.description || "")
    setTemplateStatus(template?.status || "draft")
    setTemplateCategory(template?.category || "other")
    setComponents(template?.components || {})
  }, [template])

  // Generate unique block ID
  const generateBlockId = () =>
    `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Mark as unsaved and trigger auto-save
  const markUnsaved = useCallback(() => {
    setHasUnsavedChanges(true)
    setSaveStatus("unsaved")

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new auto-save timeout (2 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      handleSave()
    }, 2000)
  }, [])

  // Add block
  const addBlock = useCallback(
    (blockType: BlockType, insertIndex?: number) => {
      const blockDef = getBlockDefinition(blockType)
      if (!blockDef) return

      const newBlock: Block = {
        id: generateBlockId(),
        type: blockType,
        ...blockDef.defaultProps,
      } as Block

      setBlocks((prev) => {
        if (insertIndex !== undefined) {
          const updated = [...prev]
          updated.splice(insertIndex, 0, newBlock)
          return updated
        }
        return [...prev, newBlock]
      })

      setSelectedBlockId(newBlock.id)
      markUnsaved()
    },
    [markUnsaved]
  )

  // Delete block
  const deleteBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId))
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null)
      }
      markUnsaved()
    },
    [selectedBlockId, markUnsaved]
  )

  // Update block properties
  const updateBlock = useCallback(
    (blockId: string, updates: Partial<Block>) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId ? ({ ...b, ...updates } as Block) : b
        )
      )
      markUnsaved()
    },
    [markUnsaved]
  )

  // Handle document property changes
  const handleNameChange = useCallback((name: string) => {
    setTemplateName(name)
    markUnsaved()
  }, [markUnsaved])

  const handleDescriptionChange = useCallback((description: string) => {
    setTemplateDescription(description)
    markUnsaved()
  }, [markUnsaved])

  const handleStatusChange = useCallback((status: TemplateStatus) => {
    setTemplateStatus(status)
    markUnsaved()
  }, [markUnsaved])

  const handleCategoryChange = useCallback((category: string) => {
    setTemplateCategory(category)
    markUnsaved()
  }, [markUnsaved])

  const handleComponentChange = useCallback((componentType: string, componentId: string) => {
    setComponents(prev => {
      const updated = { ...prev }
      switch (componentType) {
        case "coverPage":
          updated.coverPageId = componentId || undefined
          break
        case "header":
          updated.headerId = componentId || undefined
          break
        case "footer":
          updated.footerId = componentId || undefined
          break
        case "endPage":
          updated.endPageId = componentId || undefined
          break
      }
      return updated
    })
    markUnsaved()
  }, [markUnsaved])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // Check if dragging from palette
    if (active.data.current?.type === "palette-block") {
      const blockType = active.data.current.blockType as BlockType
      addBlock(blockType)
      return
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id)
        const newIndex = prev.findIndex((b) => b.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
      markUnsaved()
    }
  }

  // Save to Firestore
  const handleSave = async () => {
    setSaveStatus("saving")
    try {
      await updateDoc(doc(db, "templates", template.id), {
        name: templateName,
        description: templateDescription,
        status: templateStatus,
        category: templateCategory,
        components,
        content: { blocks },
        updatedAt: serverTimestamp(),
      })

      setSaveStatus("saved")
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error saving template:", error)
      setSaveStatus("unsaved")
      toast.error("Failed to save template")
    }
  }

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        onClose()
      }
    } else {
      onClose()
    }
  }

  // Toggle preview mode
  const handleTogglePreview = () => {
    if (hasUnsavedChanges && !previewMode) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Switch to preview anyway?"
      )
      if (!confirmSwitch) return
    }
    setPreviewMode(!previewMode)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasUnsavedChanges])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* TOP TOOLBAR */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
        {/* Left: Back button and template name */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="h-6 w-px bg-border" />

          <Input
            value={templateName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="h-9 w-64 border-transparent bg-transparent text-lg font-semibold focus-visible:border-input focus-visible:ring-0"
          />
        </div>

        {/* Right: Preview toggle, save status, save button */}
        <div className="flex items-center gap-4">
          {/* Preview toggle */}
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePreview}
            className={cn(
              previewMode &&
                "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
            )}
          >
            {previewMode ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>

          {/* Save status indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              saveStatus === "saved" && "text-emerald-600",
              saveStatus === "saving" && "text-muted-foreground",
              saveStatus === "unsaved" && "text-amber-600"
            )}
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="h-3 w-3" />
                Saved
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </>
            )}
          </div>

          {/* Save button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* THREE-PANEL LAYOUT with DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <EditorLayout
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          previewMode={previewMode}
          isDragging={activeId !== null}
          onAddBlock={addBlock}
          onSelectBlock={setSelectedBlockId}
          onDeleteBlock={deleteBlock}
          onUpdateBlock={updateBlock}
          // Document properties
          templateName={templateName}
          templateDescription={templateDescription}
          templateStatus={templateStatus}
          templateCategory={templateCategory}
          components={components}
          onNameChange={handleNameChange}
          onDescriptionChange={handleDescriptionChange}
          onStatusChange={handleStatusChange}
          onCategoryChange={handleCategoryChange}
          onComponentChange={handleComponentChange}
        />

        {/* Drag overlay for visual feedback */}
        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border bg-white p-3 shadow-lg">
              <span className="text-sm font-medium">
                {blocks.find((b) => b.id === activeId)?.type || "Block"}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default EditorModal
