import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { AcknowledgmentBlock, SignerRole } from "../../../types"

interface AcknowledgmentPropertiesProps {
  block: AcknowledgmentBlock
  onUpdate: (updates: Partial<AcknowledgmentBlock>) => void
}

/**
 * AcknowledgmentProperties - Properties panel for acknowledgment blocks
 * Fields: text, role, required
 * Legacy block type - checkbox with acknowledgment text
 */
export function AcknowledgmentProperties({ block, onUpdate }: AcknowledgmentPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Legacy Block Notice */}
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-amber-700">
          <strong>Legacy Block:</strong> This is an older acknowledgment format. Consider using the newer checkbox field for more flexibility.
        </p>
      </div>

      {/* Acknowledgment Text */}
      <div className="space-y-2">
        <Label htmlFor="ack-text" className="text-xs font-semibold text-muted-foreground">
          Acknowledgment Text
        </Label>
        <Textarea
          id="ack-text"
          value={block.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="I acknowledge..."
          rows={4}
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

export default AcknowledgmentProperties
