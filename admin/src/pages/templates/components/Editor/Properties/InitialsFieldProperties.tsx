import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { InitialsFieldBlock, SignerRole } from "../../../types"

interface InitialsFieldPropertiesProps {
  block: InitialsFieldBlock
  onUpdate: (updates: Partial<InitialsFieldBlock>) => void
}

/**
 * InitialsFieldProperties - Properties panel for initials field blocks
 * Fields: label, role, required
 */
export function InitialsFieldProperties({ block, onUpdate }: InitialsFieldPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Field Label */}
      <div className="space-y-2">
        <Label htmlFor="initials-label" className="text-xs font-semibold text-muted-foreground">
          Field Label
        </Label>
        <Input
          id="initials-label"
          type="text"
          value={block.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Initials"
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

export default InitialsFieldProperties
