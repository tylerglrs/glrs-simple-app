import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface RequiredToggleProps {
  value: boolean
  onChange: (required: boolean) => void
}

/**
 * RequiredToggle - Shared toggle for required field setting
 */
export function RequiredToggle({ value, onChange }: RequiredToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <Label
        htmlFor="required-toggle"
        className="cursor-pointer text-sm text-muted-foreground"
      >
        Required field
      </Label>
      <Switch
        id="required-toggle"
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  )
}

export default RequiredToggle
