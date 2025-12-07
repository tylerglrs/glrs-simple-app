import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { TextInputFieldBlock, SignerRole } from "../../../types"

interface TextInputFieldPropertiesProps {
  block: TextInputFieldBlock
  onUpdate: (updates: Partial<TextInputFieldBlock>) => void
}

/**
 * TextInputFieldProperties - Properties panel for text input field blocks
 * Fields: label, placeholder, maxLength, role, required
 */
export function TextInputFieldProperties({ block, onUpdate }: TextInputFieldPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Field Label */}
      <div className="space-y-2">
        <Label htmlFor="text-label" className="text-xs font-semibold text-muted-foreground">
          Field Label
        </Label>
        <Input
          id="text-label"
          type="text"
          value={block.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Full Name"
        />
      </div>

      {/* Placeholder Text */}
      <div className="space-y-2">
        <Label htmlFor="text-placeholder" className="text-xs font-semibold text-muted-foreground">
          Placeholder Text
        </Label>
        <Input
          id="text-placeholder"
          type="text"
          value={block.placeholder || ""}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="e.g., Enter your full name"
        />
      </div>

      {/* Max Length */}
      <div className="space-y-2">
        <Label htmlFor="text-maxlength" className="text-xs font-semibold text-muted-foreground">
          Max Length
        </Label>
        <Input
          id="text-maxlength"
          type="number"
          value={block.maxLength || 100}
          onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || 100 })}
          min={1}
          max={500}
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

export default TextInputFieldProperties
