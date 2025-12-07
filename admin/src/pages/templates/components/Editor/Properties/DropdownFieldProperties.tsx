import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { RoleSelector } from "./RoleSelector"
import { RequiredToggle } from "./RequiredToggle"
import type { DropdownFieldBlock, SignerRole } from "../../../types"

interface DropdownFieldPropertiesProps {
  block: DropdownFieldBlock
  onUpdate: (updates: Partial<DropdownFieldBlock>) => void
}

/**
 * DropdownFieldProperties - Properties panel for dropdown field blocks
 * Fields: label, options array, role, required
 */
export function DropdownFieldProperties({ block, onUpdate }: DropdownFieldPropertiesProps) {
  const options = block.options || []

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    onUpdate({ options: newOptions })
  }

  const handleAddOption = () => {
    const newOptions = [...options, "New option"]
    onUpdate({ options: newOptions })
  }

  return (
    <div className="space-y-4">
      {/* Field Label */}
      <div className="space-y-2">
        <Label htmlFor="dropdown-label" className="text-xs font-semibold text-muted-foreground">
          Field Label
        </Label>
        <Input
          id="dropdown-label"
          type="text"
          value={block.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Relationship Type"
        />
      </div>

      {/* Dropdown Options */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">
          Dropdown Options
        </Label>

        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveOption(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAddOption}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      {options.length === 0 && (
        <div className="rounded-md bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            No options yet. Click "Add Option" to create dropdown choices.
          </p>
        </div>
      )}

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

export default DropdownFieldProperties
