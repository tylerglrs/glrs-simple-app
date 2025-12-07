import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  FileText,
  BookOpen,
  FileType2,
  AlignLeft,
  FileOutput,
  Upload,
  File,
  Folder,
  Heart,
  Star,
  Shield,
  Users,
  Home,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  Award,
  Flag,
  Bookmark,
  Tag,
  Lock,
  Unlock,
  Eye,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Predefined colors for template icons
const ICON_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Green", value: "#22C55E" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Gray", value: "#6B7280" },
  { name: "Slate", value: "#475569" },
]

// Available icons for selection
const AVAILABLE_ICONS: Array<{ name: string; icon: LucideIcon }> = [
  { name: "FileText", icon: FileText },
  { name: "BookOpen", icon: BookOpen },
  { name: "FileType2", icon: FileType2 },
  { name: "AlignLeft", icon: AlignLeft },
  { name: "FileOutput", icon: FileOutput },
  { name: "Upload", icon: Upload },
  { name: "File", icon: File },
  { name: "Folder", icon: Folder },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Shield", icon: Shield },
  { name: "Users", icon: Users },
  { name: "Home", icon: Home },
  { name: "Settings", icon: Settings },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "AlertCircle", icon: AlertCircle },
  { name: "Info", icon: Info },
  { name: "HelpCircle", icon: HelpCircle },
  { name: "Clock", icon: Clock },
  { name: "Calendar", icon: Calendar },
  { name: "MapPin", icon: MapPin },
  { name: "Phone", icon: Phone },
  { name: "Mail", icon: Mail },
  { name: "Globe", icon: Globe },
  { name: "Briefcase", icon: Briefcase },
  { name: "Award", icon: Award },
  { name: "Flag", icon: Flag },
  { name: "Bookmark", icon: Bookmark },
  { name: "Tag", icon: Tag },
  { name: "Lock", icon: Lock },
  { name: "Unlock", icon: Unlock },
  { name: "Eye", icon: Eye },
]

interface IconPickerProps {
  selectedColor: string
  selectedIcon: string
  onColorChange: (color: string) => void
  onIconChange: (icon: string) => void
  compact?: boolean
}

/**
 * IconPicker - Color and icon selection component for templates
 * Ported from templates.html lines 1222-1341
 */
export function IconPicker({
  selectedColor,
  selectedIcon,
  onColorChange,
  onIconChange,
  compact = false,
}: IconPickerProps) {
  const [showIcons, setShowIcons] = useState(false)

  // Find the selected icon component
  const SelectedIconComponent =
    AVAILABLE_ICONS.find((i) => i.name === selectedIcon)?.icon || FileText

  return (
    <div className="space-y-4">
      {/* Color Selection */}
      <div>
        <Label className="mb-2 block text-sm font-medium text-muted-foreground">
          Icon Color
        </Label>
        <div className="flex flex-wrap gap-2">
          {ICON_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onColorChange(color.value)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                selectedColor === color.value
                  ? "border-foreground ring-2 ring-offset-2"
                  : "border-transparent"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Icon Selection */}
      <div>
        <Label className="mb-2 block text-sm font-medium text-muted-foreground">
          Icon
        </Label>

        {/* Preview / Toggle Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowIcons(!showIcons)}
          className={cn(
            "flex h-auto items-center gap-3 px-4 py-3",
            compact && "w-full justify-start"
          )}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${selectedColor}20` }}
          >
            <SelectedIconComponent
              className="h-5 w-5"
              style={{ color: selectedColor }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {showIcons ? "Hide icons" : "Change icon"}
          </span>
        </Button>

        {/* Icon Grid */}
        {showIcons && (
          <div className="mt-3 grid grid-cols-8 gap-2 rounded-lg border bg-muted/30 p-3">
            {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onIconChange(name)
                  setShowIcons(false)
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border transition-all hover:bg-white hover:shadow-sm",
                  selectedIcon === name
                    ? "border-primary bg-white shadow-sm"
                    : "border-transparent"
                )}
                title={name}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: selectedIcon === name ? selectedColor : "#6B7280" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Export the icon lookup function for use in other components
export function getIconComponent(iconName: string): LucideIcon {
  return AVAILABLE_ICONS.find((i) => i.name === iconName)?.icon || FileText
}

// Export the color palette for use in other components
export { ICON_COLORS, AVAILABLE_ICONS }

export default IconPicker
