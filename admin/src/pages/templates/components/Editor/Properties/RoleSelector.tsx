import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { SignerRole } from "../../../types"
import { SIGNER_ROLES } from "../../../constants"
import { cn } from "@/lib/utils"

interface RoleSelectorProps {
  value: SignerRole
  onChange: (role: SignerRole) => void
}

/**
 * RoleSelector - Shared component for selecting signer role
 * Used by all signature field property panels
 */
export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground">
        Signer Role
      </Label>
      <div className="flex flex-col gap-2">
        {Object.entries(SIGNER_ROLES).map(([role, roleData]) => (
          <Button
            key={role}
            type="button"
            variant="outline"
            onClick={() => onChange(role as SignerRole)}
            className={cn(
              "justify-start gap-3 h-auto py-2.5 px-3",
              value === role && "ring-2 ring-offset-1"
            )}
            style={{
              backgroundColor: value === role ? roleData.bgLight : undefined,
              borderColor: value === role ? roleData.borderColor : undefined,
              // @ts-expect-error: --tw-ring-color is a Tailwind CSS variable
              "--tw-ring-color": value === role ? roleData.borderColor : undefined,
            }}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: roleData.borderColor }}
            />
            <div className="flex flex-col items-start">
              <span
                className={cn(
                  "text-sm",
                  value === role ? "font-semibold" : "font-normal"
                )}
                style={{ color: value === role ? roleData.color : undefined }}
              >
                {roleData.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {roleData.fullLabel}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default RoleSelector
