import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { DateFieldBlock, SignerRole } from "../../../types"

interface DateFieldPropertiesProps {
  block: DateFieldBlock
  onUpdate: (updates: Partial<DateFieldBlock>) => void
}

/**
 * DateFieldProperties - Properties panel for date field blocks
 * Fields: label, role, autoFill, required
 */
export function DateFieldProperties({ block, onUpdate }: DateFieldPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Field Label */}
      <div className="space-y-2">
        <Label htmlFor="date-label" className="text-xs font-semibold text-muted-foreground">
          Field Label
        </Label>
        <Input
          id="date-label"
          type="text"
          value={block.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Date Signed"
        />
      </div>

      {/* Signer Role */}
      <RoleSelector
        value={block.role || "pir"}
        onChange={(role: SignerRole) => onUpdate({ role })}
      />

      {/* Auto-fill Toggle */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="autofill-toggle"
          className="cursor-pointer text-sm text-muted-foreground"
        >
          Auto-fill with current date
        </Label>
        <Switch
          id="autofill-toggle"
          checked={block.autoFill || false}
          onCheckedChange={(autoFill) => onUpdate({ autoFill })}
        />
      </div>

      {/* Required Toggle */}
      <RequiredToggle
        value={block.required || false}
        onChange={(required) => onUpdate({ required })}
      />
    </div>
  )
}

export default DateFieldProperties
