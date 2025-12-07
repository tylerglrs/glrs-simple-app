import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PaletteBlock } from "./PaletteBlock"
import { getBlocksByCategory } from "../../constants"
import type { BlockType } from "../../types"

interface BlockPaletteProps {
  onAddBlock: (blockType: BlockType) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

/**
 * BlockPalette - Left panel with draggable block types grouped by category
 * Ported from templates.html lines 4109-4219
 */
export function BlockPalette({
  onAddBlock,
  collapsed = false,
  onToggleCollapse,
}: BlockPaletteProps) {
  const structureBlocks = getBlocksByCategory("structure")
  const contentBlocks = getBlocksByCategory("content")
  const signatureBlocks = getBlocksByCategory("signature")
  const legacyBlocks = getBlocksByCategory("legacy")

  if (collapsed) {
    return (
      <div className="flex h-full w-12 flex-col border-r bg-white">
        <div className="flex justify-center border-b p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-6 w-6"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Blocks</h3>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-6 w-6"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Block list */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {/* Structure blocks */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Structure
          </div>
          <div className="space-y-2">
            {structureBlocks.map((blockType) => (
              <PaletteBlock
                key={blockType.type}
                blockType={blockType}
                onClick={() => onAddBlock(blockType.type)}
              />
            ))}
          </div>
        </div>

        {/* Content blocks */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Content
          </div>
          <div className="space-y-2">
            {contentBlocks.map((blockType) => (
              <PaletteBlock
                key={blockType.type}
                blockType={blockType}
                onClick={() => onAddBlock(blockType.type)}
              />
            ))}
          </div>
        </div>

        {/* Signature Fields */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Signature Fields
          </div>
          <div className="space-y-2">
            {signatureBlocks.map((blockType) => (
              <PaletteBlock
                key={blockType.type}
                blockType={blockType}
                onClick={() => onAddBlock(blockType.type)}
              />
            ))}
          </div>
        </div>

        {/* Legacy blocks */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
            Legacy
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal">
              old
            </span>
          </div>
          <div className="space-y-2">
            {legacyBlocks.map((blockType) => (
              <PaletteBlock
                key={blockType.type}
                blockType={blockType}
                onClick={() => onAddBlock(blockType.type)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockPalette
