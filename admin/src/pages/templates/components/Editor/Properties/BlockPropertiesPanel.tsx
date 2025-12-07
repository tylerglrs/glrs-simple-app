import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { getBlockDefinition, getIconComponent } from "../../../constants"
import type { Block } from "../../../types"

// Import all property components
import { SectionProperties } from "./SectionProperties"
import { HeadingProperties } from "./HeadingProperties"
import { PageBreakProperties } from "./PageBreakProperties"
import { ParagraphProperties } from "./ParagraphProperties"
import { BulletListProperties } from "./BulletListProperties"
import { SignatureFieldProperties } from "./SignatureFieldProperties"
import { InitialsFieldProperties } from "./InitialsFieldProperties"
import { DateFieldProperties } from "./DateFieldProperties"
import { TextInputFieldProperties } from "./TextInputFieldProperties"
import { CheckboxFieldProperties } from "./CheckboxFieldProperties"
import { DropdownFieldProperties } from "./DropdownFieldProperties"
import { SignatureBlockProperties } from "./SignatureBlockProperties"
import { AcknowledgmentProperties } from "./AcknowledgmentProperties"

interface BlockPropertiesPanelProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  onDeselect: () => void
}

/**
 * BlockPropertiesPanel - Container that switches based on block type
 * Ported from templates.html lines 6407-7632
 */
export function BlockPropertiesPanel({
  block,
  onUpdate,
  onDeselect,
}: BlockPropertiesPanelProps) {
  const blockDef = getBlockDefinition(block.type)
  const IconComponent = getIconComponent(blockDef?.icon || "FileText")

  return (
    <div className="space-y-4">
      {/* Deselect button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onDeselect}
        className="h-8 gap-1.5 text-xs text-muted-foreground"
      >
        <X className="h-3 w-3" />
        Deselect
      </Button>

      {/* Block type indicator */}
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2.5">
        <IconComponent className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          {blockDef?.label || block.type}
        </span>
      </div>

      {/* Block-specific properties */}
      <div className="pt-2">
        {/* Structure blocks */}
        {block.type === "section" && (
          <SectionProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "heading" && (
          <HeadingProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "pageBreak" && (
          <PageBreakProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {/* Content blocks */}
        {block.type === "paragraph" && (
          <ParagraphProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "bulletList" && (
          <BulletListProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {/* Signature field blocks */}
        {block.type === "signatureField" && (
          <SignatureFieldProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "initialsField" && (
          <InitialsFieldProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "dateField" && (
          <DateFieldProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "textInputField" && (
          <TextInputFieldProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "checkboxField" && (
          <CheckboxFieldProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "dropdownField" && (
          <DropdownFieldProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {/* Legacy blocks */}
        {block.type === "signatureBlock" && (
          <SignatureBlockProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}

        {block.type === "acknowledgment" && (
          <AcknowledgmentProperties
            block={block}
            onUpdate={(updates) => onUpdate(updates as Partial<Block>)}
          />
        )}
      </div>
    </div>
  )
}

export default BlockPropertiesPanel
