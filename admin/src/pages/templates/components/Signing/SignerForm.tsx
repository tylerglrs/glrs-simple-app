import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info, AlertTriangle } from "lucide-react"
import type { SignerRole, SignerFormData } from "../../types"
import { SIGNER_ROLES } from "../../constants"

interface SignerFormProps {
  role: SignerRole
  data: SignerFormData
  errors: Record<string, string>
  onChange: (field: keyof SignerFormData, value: string) => void
}

/**
 * SignerForm - Form for collecting signer information
 * Ported from templates.html lines 9050-9180
 *
 * Features:
 * - Role indicator with color coding
 * - Name input (required)
 * - Email input (required, except for GLRS)
 * - Signing order indicator
 * - Validation feedback
 */
export function SignerForm({ role, data, errors, onChange }: SignerFormProps) {
  const roleConfig = SIGNER_ROLES[role]

  return (
    <div
      className="rounded-lg border-2 p-4"
      style={{
        borderColor: roleConfig.borderColor,
        backgroundColor: roleConfig.bgLight,
      }}
    >
      {/* Role Header */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: roleConfig.color }}
        />
        <span
          className="text-sm font-semibold"
          style={{ color: roleConfig.color }}
        >
          {roleConfig.fullLabel}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Signs #{data.order + 1}
        </span>
      </div>

      {/* Name Field */}
      <div className="mb-3">
        <Label className="mb-1 block text-xs text-muted-foreground">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          type="text"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder={`Enter ${roleConfig.label} name`}
          className={
            errors[`${role}_name`]
              ? "border-destructive focus-visible:ring-destructive"
              : "bg-white"
          }
        />
        {errors[`${role}_name`] && (
          <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {errors[`${role}_name`]}
          </div>
        )}
      </div>

      {/* Email Field (not for GLRS) */}
      {role !== "glrs" ? (
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder={`Enter ${roleConfig.label} email`}
            className={
              errors[`${role}_email`]
                ? "border-destructive focus-visible:ring-destructive"
                : "bg-white"
            }
          />
          {errors[`${role}_email`] && (
            <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {errors[`${role}_email`]}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-white/50 p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 flex-shrink-0" />
          GLRS representative signs in the admin portal
        </div>
      )}
    </div>
  )
}

export default SignerForm
