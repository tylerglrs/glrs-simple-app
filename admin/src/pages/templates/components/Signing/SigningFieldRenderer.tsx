import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle } from "lucide-react"
import type { Block, SignerRole } from "../../types"
import { SIGNER_ROLES, ROLE_COLORS } from "../../constants"

interface SigningFieldRendererProps {
  /** The block/field to render */
  field: Block & { role?: SignerRole; required?: boolean; label?: string }
  /** Current value of the field */
  value: unknown
  /** Whether this field is for the current signer role */
  isCurrentRole: boolean
  /** Callback when field value changes */
  onChange: (value: unknown) => void
  /** Callback when signature field is clicked (to open signature capture) */
  onSignatureClick: () => void
}

/**
 * SigningFieldRenderer - Renders a field for signing
 * Different from editor BlockRenderer - this is for filling fields
 *
 * Features:
 * - Different rendering based on field type
 * - Role-based styling (PIR blue, Family green, GLRS orange)
 * - Disabled state for fields not assigned to current role
 * - Completed state shows filled value with checkmark
 * - Click handler for signature fields
 */
export function SigningFieldRenderer({
  field,
  value,
  isCurrentRole,
  onChange,
  onSignatureClick,
}: SigningFieldRendererProps) {
  const hasValue = value !== undefined && value !== null && value !== ""
  const role = field.role || "pir"
  const roleColors = ROLE_COLORS[role] || ROLE_COLORS.pir

  // Check if this is a signature-type field
  const isSignatureField = ["signatureField", "signatureBlock", "initialsField"].includes(field.type)

  return (
    <div
      onClick={() => isCurrentRole && isSignatureField && onSignatureClick()}
      className={`rounded-lg border-2 p-4 transition-all ${
        isSignatureField && isCurrentRole ? "cursor-pointer hover:shadow-md" : ""
      }`}
      style={{
        borderColor: roleColors.border,
        backgroundColor: roleColors.bg,
        opacity: isCurrentRole ? 1 : 0.6,
      }}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-xs font-semibold"
          style={{ color: roleColors.text }}
        >
          {field.label || field.type}
          {field.required && <span className="text-destructive"> *</span>}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: SIGNER_ROLES[role]?.bgLight,
              color: SIGNER_ROLES[role]?.color,
            }}
          >
            {SIGNER_ROLES[role]?.label || role}
          </span>
          {hasValue && <CheckCircle className="h-4 w-4 text-emerald-500" />}
        </div>
      </div>

      {/* Signature / Initials Field */}
      {isSignatureField && (
        <div
          className={`flex items-center justify-center rounded border-2 border-dashed bg-white ${
            field.type === "initialsField" ? "h-12" : "h-16"
          }`}
          style={{
            borderColor: hasValue ? "#16a34a" : roleColors.border,
          }}
        >
          {hasValue && typeof value === "string" ? (
            <img
              src={value}
              alt="Signature"
              className="max-h-12 object-contain"
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              {isCurrentRole ? "Click to sign" : "Awaiting signature"}
            </span>
          )}
        </div>
      )}

      {/* Date Field */}
      {field.type === "dateField" && (
        <Input
          type="date"
          value={
            typeof value === "string"
              ? value
              : new Date().toISOString().split("T")[0]
          }
          onChange={(e) => onChange(e.target.value)}
          disabled={!isCurrentRole}
          className="bg-white"
        />
      )}

      {/* Text Input Field */}
      {field.type === "textInputField" && (
        <Input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            "placeholder" in field
              ? (field.placeholder as string) || "Enter text..."
              : "Enter text..."
          }
          disabled={!isCurrentRole}
          className="bg-white"
        />
      )}

      {/* Checkbox Field */}
      {field.type === "checkboxField" && (
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={!isCurrentRole}
          />
          <span className="text-sm text-slate-600">{field.label}</span>
        </label>
      )}

      {/* Dropdown Field */}
      {field.type === "dropdownField" && "options" in field && (
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={(v) => onChange(v)}
          disabled={!isCurrentRole}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options as string[])?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

export default SigningFieldRenderer
