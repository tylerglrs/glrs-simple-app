import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Megaphone, BarChart3, FileText, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  label: string
  icon: React.ElementType
  href?: string
  onClick?: () => void
  permission?: string
  variant: "primary" | "secondary" | "accent" | "info"
}

interface QuickActionsProps {
  onSendBroadcast?: () => void
  onCreatePIR?: () => void
}

const variantStyles = {
  primary: {
    bg: "bg-primary/10 hover:bg-primary/20",
    border: "border-primary/20",
    text: "text-primary",
    iconColor: "text-primary",
  },
  secondary: {
    bg: "bg-emerald-50 hover:bg-emerald-100",
    border: "border-emerald-200",
    text: "text-emerald-700",
    iconColor: "text-emerald-600",
  },
  accent: {
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-700",
    iconColor: "text-blue-600",
  },
  info: {
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-700",
    iconColor: "text-purple-600",
  },
}

export function QuickActions({ onSendBroadcast, onCreatePIR }: QuickActionsProps) {
  const navigate = useNavigate()
  const { canPerformAction } = useAuth()

  const actions: QuickAction[] = [
    {
      label: "New PIR",
      icon: UserPlus,
      onClick: onCreatePIR,
      permission: "create_pir",
      variant: "primary",
    },
    {
      label: "Send Broadcast",
      icon: Megaphone,
      onClick: onSendBroadcast,
      permission: "send_broadcast",
      variant: "accent",
    },
    {
      label: "View Logs",
      icon: FileText,
      href: "/logs",
      variant: "secondary",
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/logs", // Reports merged into logs
      permission: "view_analytics",
      variant: "info",
    },
  ]

  const filteredActions = actions.filter((action) => {
    if (!action.permission) return true
    return canPerformAction(action.permission)
  })

  const handleClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick()
    } else if (action.href) {
      navigate(action.href)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          {filteredActions.map((action) => {
            const styles = variantStyles[action.variant]
            const Icon = action.icon

            return (
              <button
                key={action.label}
                onClick={() => handleClick(action)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-all",
                  "hover:translate-x-1",
                  styles.bg,
                  styles.border,
                  styles.text
                )}
              >
                <Icon className={cn("h-4 w-4", styles.iconColor)} />
                <span>{action.label}</span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
