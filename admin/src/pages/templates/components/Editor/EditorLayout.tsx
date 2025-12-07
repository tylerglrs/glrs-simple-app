import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BlockPalette } from "./BlockPalette"
import { EditorCanvas } from "./EditorCanvas"
import { BlockPropertiesPanel, DocumentPropertiesPanel } from "./Properties"
import { PagePreview } from "./Preview"
import type { Block, BlockType, TemplateStatus, TemplateComponents } from "../../types"
import { cn } from "@/lib/utils"

interface ComponentOption {
  id: string
  name: string
  status: TemplateStatus
}

interface AvailableComponents {
  covers: ComponentOption[]
  headers: ComponentOption[]
  footers: ComponentOption[]
  endPages: ComponentOption[]
}

interface EditorLayoutProps {
  blocks: Block[]
  selectedBlockId: string | null
  previewMode: boolean
  isDragging: boolean
  onAddBlock: (blockType: BlockType, index?: number) => void
  onSelectBlock: (blockId: string | null) => void
  onDeleteBlock: (blockId: string) => void
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void
  // Document properties
  templateName: string
  templateDescription: string
  templateStatus: TemplateStatus
  templateCategory: string
  components?: TemplateComponents
  availableComponents?: AvailableComponents
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
  onStatusChange: (status: TemplateStatus) => void
  onCategoryChange: (category: string) => void
  onComponentChange?: (componentType: string, componentId: string) => void
  onOpenComponentEditor?: (componentType: string, componentId?: string) => void
}

/**
 * EditorLayout - 3-panel layout (palette | canvas | properties)
 * Ported from templates.html lines 4056-4508
 */
export function EditorLayout({
  blocks,
  selectedBlockId,
  previewMode,
  isDragging,
  onAddBlock,
  onSelectBlock,
  onDeleteBlock,
  onUpdateBlock,
  // Document properties
  templateName,
  templateDescription,
  templateStatus,
  templateCategory,
  components,
  availableComponents,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onCategoryChange,
  onComponentChange,
  onOpenComponentEditor,
}: EditorLayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* LEFT PANEL - Block Palette (hidden in preview mode) */}
      {!previewMode && (
        <BlockPalette
          onAddBlock={onAddBlock}
          collapsed={leftPanelCollapsed}
          onToggleCollapse={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
        />
      )}

      {/* CENTER PANEL - Canvas or Preview */}
      {previewMode ? (
        <div className="flex-1 overflow-hidden">
          <PagePreview
            title={templateName}
            category={templateCategory}
            blocks={blocks}
            showCoverPage={!!components?.coverPageId}
            showEndPage={!!components?.endPageId}
            showHeaders={!!components?.headerId}
            showFooters={!!components?.footerId}
          />
        </div>
      ) : (
        <EditorCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onDeleteBlock={onDeleteBlock}
          previewMode={previewMode}
          isDragging={isDragging}
        />
      )}

      {/* RIGHT PANEL - Properties (hidden in preview mode) */}
      {!previewMode && (
        <div
          className={cn(
            "flex flex-col border-l bg-white transition-all",
            rightPanelCollapsed ? "w-12" : "w-72"
          )}
        >
          {/* Panel header */}
          <div
            className={cn(
              "flex items-center border-b px-4 py-3",
              rightPanelCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="h-6 w-6"
            >
              {rightPanelCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {!rightPanelCollapsed && (
              <h3 className="text-sm font-semibold text-muted-foreground">
                {selectedBlock ? "Block Properties" : "Document Properties"}
              </h3>
            )}
          </div>

          {/* Properties content */}
          {!rightPanelCollapsed && (
            <div className="flex-1 overflow-y-auto p-4">
              {selectedBlock ? (
                // Block Properties Panel
                <BlockPropertiesPanel
                  block={selectedBlock}
                  onUpdate={(updates) => onUpdateBlock(selectedBlock.id, updates)}
                  onDeselect={() => onSelectBlock(null)}
                />
              ) : (
                // Document Properties Panel
                <DocumentPropertiesPanel
                  templateName={templateName}
                  templateDescription={templateDescription}
                  templateStatus={templateStatus}
                  templateCategory={templateCategory}
                  components={components}
                  availableComponents={availableComponents}
                  onNameChange={onNameChange}
                  onDescriptionChange={onDescriptionChange}
                  onStatusChange={onStatusChange}
                  onCategoryChange={onCategoryChange}
                  onComponentChange={onComponentChange}
                  onOpenComponentEditor={onOpenComponentEditor}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EditorLayout
