import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import type { BulletListBlock } from "../../../types"

interface BulletListPropertiesProps {
  block: BulletListBlock
  onUpdate: (updates: Partial<BulletListBlock>) => void
}

/**
 * BulletListProperties - Properties panel for bullet list blocks
 * Fields: items array with add/remove functionality
 */
export function BulletListProperties({ block, onUpdate }: BulletListPropertiesProps) {
  const items = block.items || []

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    onUpdate({ items: newItems })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onUpdate({ items: newItems })
  }

  const handleAddItem = () => {
    const newItems = [...items, "New item"]
    onUpdate({ items: newItems })
  }

  return (
    <div className="space-y-4">
      {/* List Items */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">
          List Items
        </Label>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 && (
        <div className="rounded-md bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            No items yet. Click "Add Item" to create your first bullet point.
          </p>
        </div>
      )}
    </div>
  )
}

export default BulletListProperties
