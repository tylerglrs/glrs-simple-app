import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { HeadingBlock } from "../../../types"

interface HeadingPropertiesProps {
  block: HeadingBlock
  onUpdate: (updates: Partial<HeadingBlock>) => void
}

/**
 * HeadingProperties - Properties panel for heading blocks
 * Fields: content, level (1-4)
 */
export function HeadingProperties({ block, onUpdate }: HeadingPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Heading Text */}
      <div className="space-y-2">
        <Label htmlFor="heading-text" className="text-xs font-semibold text-muted-foreground">
          Heading Text
        </Label>
        <Input
          id="heading-text"
          type="text"
          value={block.content || ""}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Heading text"
        />
      </div>

      {/* Heading Level */}
      <div className="space-y-2">
        <Label htmlFor="heading-level" className="text-xs font-semibold text-muted-foreground">
          Heading Level
        </Label>
        <Select
          value={String(block.level || 3)}
          onValueChange={(value) => onUpdate({ level: parseInt(value) as 1 | 2 | 3 | 4 })}
        >
          <SelectTrigger id="heading-level">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Level 1 (Largest)</SelectItem>
            <SelectItem value="2">Level 2</SelectItem>
            <SelectItem value="3">Level 3</SelectItem>
            <SelectItem value="4">Level 4 (Smallest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default HeadingProperties
