import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { SignatureBlockLegacy, SignerRole } from "../../../types"

interface SignatureBlockPropertiesProps {
  block: SignatureBlockLegacy
  onUpdate: (updates: Partial<SignatureBlockLegacy>) => void
}

/**
 * SignatureBlockProperties - Properties panel for legacy signature blocks
 * Fields: label, role, required
 * Legacy block type - includes signature line, name line, and date line
 */
export function SignatureBlockProperties({ block, onUpdate }: SignatureBlockPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Legacy Block Notice */}
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-amber-700">
          <strong>Legacy Block:</strong> This is an older signature block format. Consider using the newer individual signature fields for more flexibility.
        </p>
      </div>

      {/* Field Label */}
      <div className="space-y-2">
        <Label htmlFor="sigblock-label" className="text-xs font-semibold text-muted-foreground">
          Label
        </Label>
        <Input
          id="sigblock-label"
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

export default SignatureBlockProperties
