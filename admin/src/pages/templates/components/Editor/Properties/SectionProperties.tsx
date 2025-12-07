import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SectionBlock } from "../../../types"

interface SectionPropertiesProps {
  block: SectionBlock
  onUpdate: (updates: Partial<SectionBlock>) => void
}

/**
 * SectionProperties - Properties panel for section blocks
 * Fields: number, title
 */
export function SectionProperties({ block, onUpdate }: SectionPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Section Number */}
      <div className="space-y-2">
        <Label htmlFor="section-number" className="text-xs font-semibold text-muted-foreground">
          Section Number
        </Label>
        <Input
          id="section-number"
          type="text"
          value={block.number || ""}
          onChange={(e) => onUpdate({ number: e.target.value })}
          placeholder="1"
        />
      </div>

      {/* Section Title */}
      <div className="space-y-2">
        <Label htmlFor="section-title" className="text-xs font-semibold text-muted-foreground">
          Section Title
        </Label>
        <Input
          id="section-title"
          type="text"
          value={block.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Section Title"
        />
      </div>
    </div>
  )
}

export default SectionProperties
