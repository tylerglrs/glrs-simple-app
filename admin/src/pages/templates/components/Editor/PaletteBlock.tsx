import { useDraggable } from "@dnd-kit/core"
import {
  FileText,
  Scissors,
  List,
  PenTool,
  User,
  Calendar,
  Type,
  CheckSquare,
  ChevronDown,
  GripVertical,
} from "lucide-react"
import type { BlockDefinition } from "../../types"
import { cn } from "@/lib/utils"

// Icon mapping from string name to component
const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Scissors,
  List,
  PenTool,
  User,
  Calendar,
  Type,
  CheckSquare,
  ChevronDown,
}

interface PaletteBlockProps {
  blockType: BlockDefinition
  onClick?: () => void
}

/**
 * PaletteBlock - Individual draggable block in the palette
 * Ported from templates.html lines 5582-5644
 */
export function PaletteBlock({ blockType, onClick }: PaletteBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${blockType.type}`,
    data: {
      type: "palette-block",
      blockType: blockType.type,
    },
  })

  const Icon = ICON_MAP[blockType.icon] || FileText

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "flex cursor-grab items-center gap-2.5 rounded-lg border bg-white p-2.5 transition-all",
        "hover:border-primary hover:bg-slate-50",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Drag handle dots */}
      <div className="flex flex-col gap-0.5">
        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      </div>

      {/* Icon */}
      <Icon className="h-4 w-4 text-muted-foreground" />

      {/* Label */}
      <span className="text-sm font-medium text-foreground">
        {blockType.label}
      </span>
    </div>
  )
}

export default PaletteBlock
