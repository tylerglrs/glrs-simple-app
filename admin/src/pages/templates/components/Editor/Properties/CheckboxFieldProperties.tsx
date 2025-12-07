import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { CheckboxFieldBlock, SignerRole } from "../../../types"

interface CheckboxFieldPropertiesProps {
  block: CheckboxFieldBlock
  onUpdate: (updates: Partial<CheckboxFieldBlock>) => void
}

/**
 * CheckboxFieldProperties - Properties panel for checkbox field blocks
 * Fields: label (textarea for longer text), role, required
 */
export function CheckboxFieldProperties({ block, onUpdate }: CheckboxFieldPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Checkbox Label */}
      <div className="space-y-2">
        <Label htmlFor="checkbox-label" className="text-xs font-semibold text-muted-foreground">
          Checkbox Label
        </Label>
        <Textarea
          id="checkbox-label"
          value={block.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., I agree to the terms and conditions"
          rows={3}
          className="resize-y font-sans leading-relaxed"
        />
      </div>

      {/* Signer Role */}
      <RoleSelector
        value={block.role || "pir"}
        onChange={(role: SignerRole) => onUpdate({ role })}
      />

      {/* Required Toggle */}
      <RequiredToggle
        value={block.required || false}
        onChange={(required) => onUpdate({ required })}
      />
    </div>
  )
}

export default CheckboxFieldProperties
