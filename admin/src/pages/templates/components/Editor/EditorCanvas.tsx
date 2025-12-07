import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { FileText } from "lucide-react"
import { CanvasBlock } from "./CanvasBlock"
import type { Block } from "../../types"
import { cn } from "@/lib/utils"

interface EditorCanvasProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelectBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
  previewMode?: boolean
  isDragging?: boolean
}

/**
 * EditorCanvas - Center panel with sortable blocks and drop zone
 * Ported from templates.html lines 4224-4428
 */
export function EditorCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  previewMode = false,
  isDragging = false,
}: EditorCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
  })

  // Empty state
  if (blocks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-100 p-8">
        <div
          ref={setNodeRef}
          className={cn(
            "flex max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all",
            isOver || isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30"
          )}
        >
          <FileText
            className={cn(
              "mb-4 h-12 w-12",
              isOver || isDragging ? "text-primary" : "text-muted-foreground/50"
            )}
          />
          <p className="mb-2 text-base font-medium text-muted-foreground">
            {isDragging || isOver
              ? "Drop block here"
              : "Drag blocks here to build your document"}
          </p>
          <p className="text-sm text-muted-foreground/70">
            Or click a block in the left panel to add it
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-slate-100 p-8">
      {/* Document paper */}
      <div
        ref={setNodeRef}
        className={cn(
          "mx-auto w-full max-w-[816px] rounded-lg bg-white shadow-lg transition-all",
          isOver && "ring-2 ring-primary ring-offset-2"
        )}
        style={{
          minHeight: "1056px", // US Letter height at 96 DPI
          padding: "60px", // Standard document margin
        }}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <CanvasBlock
                key={block.id}
                block={block}
                index={index}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                previewMode={previewMode}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drop indicator at bottom when dragging */}
        {isDragging && blocks.length > 0 && (
          <div
            className={cn(
              "mt-4 flex h-16 items-center justify-center rounded-lg border-2 border-dashed transition-all",
              isOver
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/20"
            )}
          >
            <span className="text-sm text-muted-foreground">
              Drop here to add at end
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorCanvas
