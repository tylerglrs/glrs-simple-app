import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ParagraphBlock } from "../../../types"

interface ParagraphPropertiesProps {
  block: ParagraphBlock
  onUpdate: (updates: Partial<ParagraphBlock>) => void
}

/**
 * ParagraphProperties - Properties panel for paragraph blocks
 * Fields: content (multiline text)
 */
export function ParagraphProperties({ block, onUpdate }: ParagraphPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="paragraph-content" className="text-xs font-semibold text-muted-foreground">
          Content
        </Label>
        <Textarea
          id="paragraph-content"
          value={block.content || ""}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter paragraph text..."
          rows={6}
          className="resize-y font-sans leading-relaxed"
        />
      </div>

      <div className="rounded-md bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Use paragraphs for body text, instructions, and descriptive content.
        </p>
      </div>
    </div>
  )
}

export default ParagraphProperties
