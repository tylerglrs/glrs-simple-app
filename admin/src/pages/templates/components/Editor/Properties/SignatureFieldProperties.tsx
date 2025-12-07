import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { SignatureFieldBlock, SignerRole } from "../../../types"

interface SignatureFieldPropertiesProps {
  block: SignatureFieldBlock
  onUpdate: (updates: Partial<SignatureFieldBlock>) => void
}

/**
 * SignatureFieldProperties - Properties panel for signature field blocks
 * Fields: label, role, required
 */
export function SignatureFieldProperties({ block, onUpdate }: SignatureFieldPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Field Label */}
      <div className="space-y-2">
        <Label htmlFor="sig-label" className="text-xs font-semibold text-muted-foreground">
          Field Label
        </Label>
        <Input
          id="sig-label"
          type="text"
          value={block.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Client Signature"
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

export default SignatureFieldProperties
