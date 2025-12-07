// ==========================================
// TEMPLATES PAGE CONSTANTS
// ==========================================

import type { BlockDefinition, SignerRoleDefinition, BlockType, SignerRole } from "./types"

// ==========================================
// BLOCK TYPE DEFINITIONS
// ==========================================

/**
 * Block types available in the template editor.
 * 14 total types across 4 categories:
 * - Structure: section, heading, pageBreak
 * - Content: paragraph, bulletList
 * - Signature: signatureField, initialsField, dateField, textInputField, checkboxField, dropdownField
 * - Legacy: signatureBlock, acknowledgment
 */
export const BLOCK_TYPES: BlockDefinition[] = [
  // Structure blocks
  {
    type: "section",
    label: "Section Header",
    icon: "FileText",
    category: "structure",
    defaultProps: { title: "Section Title", number: "1" },
  },
  {
    type: "heading",
    label: "Heading",
    icon: "FileText",
    category: "structure",
    defaultProps: { content: "Heading Text", level: 3 },
  },
  {
    type: "pageBreak",
    label: "Page Break",
    icon: "Scissors",
    category: "structure",
    defaultProps: {},
  },
  // Content blocks
  {
    type: "paragraph",
    label: "Paragraph",
    icon: "FileText",
    category: "content",
    defaultProps: { content: "Enter your text here..." },
  },
  {
    type: "bulletList",
    label: "Bullet List",
    icon: "List",
    category: "content",
    defaultProps: { items: ["Item 1", "Item 2", "Item 3"] },
  },
  // Signature Field Types (Individual)
  {
    type: "signatureField",
    label: "Signature",
    icon: "PenTool",
    category: "signature",
    defaultProps: { label: "Signature", role: "pir", required: true, fieldType: "signature" },
  },
  {
    type: "initialsField",
    label: "Initials",
    icon: "User",
    category: "signature",
    defaultProps: { label: "Initials", role: "pir", required: true, fieldType: "initials" },
  },
  {
    type: "dateField",
    label: "Date",
    icon: "Calendar",
    category: "signature",
    defaultProps: { label: "Date", role: "pir", required: true, fieldType: "date", autoFill: true },
  },
  {
    type: "textInputField",
    label: "Text Input",
    icon: "Type",
    category: "signature",
    defaultProps: {
      label: "Text Input",
      role: "pir",
      required: false,
      fieldType: "textInput",
      placeholder: "",
      maxLength: 100,
    },
  },
  {
    type: "checkboxField",
    label: "Checkbox",
    icon: "CheckSquare",
    category: "signature",
    defaultProps: { label: "I agree", role: "pir", required: true, fieldType: "checkbox" },
  },
  {
    type: "dropdownField",
    label: "Dropdown",
    icon: "ChevronDown",
    category: "signature",
    defaultProps: {
      label: "Select",
      role: "pir",
      required: true,
      fieldType: "dropdown",
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
  // Legacy combo block (keeping for backward compatibility)
  {
    type: "signatureBlock",
    label: "Signature Block",
    icon: "PenTool",
    category: "legacy",
    defaultProps: { label: "Signature", role: "pir", required: true },
  },
  {
    type: "acknowledgment",
    label: "Acknowledgment",
    icon: "CheckSquare",
    category: "legacy",
    defaultProps: {
      text: "I acknowledge that I have read and understood the above.",
      required: true,
      role: "pir",
    },
  },
]

// Helper: Get block definition by type
export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_TYPES.find((b) => b.type === type)
}

// Helper: Get icon component by name (for use with Lucide React)
// This returns a Lucide icon component based on the icon name string
import {
  FileText,
  Scissors,
  List,
  PenTool,
  User,
  Calendar,
  Type,
  CheckSquare,
  ChevronDown,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Scissors,
  List,
  PenTool,
  User,
  Calendar,
  Type,
  CheckSquare,
  ChevronDown,
}

export function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || FileText
}

// Helper: Get blocks by category
export function getBlocksByCategory(category: BlockDefinition["category"]): BlockDefinition[] {
  return BLOCK_TYPES.filter((b) => b.category === category)
}

// ==========================================
// SIGNER ROLE DEFINITIONS
// ==========================================

/**
 * Signer roles for e-signature workflow.
 * - PIR (Blue): Person in Recovery - signs first
 * - Family (Green): Family Member / Guardian - signs second (if required)
 * - GLRS (Orange): GLRS Representative - signs last (admin witness)
 */
export const SIGNER_ROLES: Record<SignerRole, SignerRoleDefinition> = {
  pir: {
    label: "PIR",
    fullLabel: "Person in Recovery",
    color: "#3B82F6",
    bgLight: "rgba(59, 130, 246, 0.1)",
    bgMedium: "rgba(59, 130, 246, 0.15)",
    borderColor: "#3B82F6",
  },
  family: {
    label: "Family",
    fullLabel: "Family Member / Guardian",
    color: "#22C55E",
    bgLight: "rgba(34, 197, 94, 0.1)",
    bgMedium: "rgba(34, 197, 94, 0.15)",
    borderColor: "#22C55E",
  },
  glrs: {
    label: "GLRS",
    fullLabel: "GLRS Representative",
    color: "#F97316",
    bgLight: "rgba(249, 115, 22, 0.1)",
    bgMedium: "rgba(249, 115, 22, 0.15)",
    borderColor: "#F97316",
  },
}

// Legacy ROLE_COLORS for backward compatibility (used in some older components)
export const ROLE_COLORS: Record<
  SignerRole,
  { bg: string; border: string; text: string; label: string }
> = {
  pir: { bg: "#DBEAFE", border: "#3B82F6", text: "#1D4ED8", label: "PIR (Blue)" },
  family: { bg: "#DCFCE7", border: "#22C55E", text: "#166534", label: "Family (Green)" },
  glrs: { bg: "#FFEDD5", border: "#F97316", text: "#C2410C", label: "GLRS (Orange)" },
}

// Helper: Get role definition
export function getSignerRole(role: SignerRole): SignerRoleDefinition {
  return SIGNER_ROLES[role]
}

// ==========================================
// TEMPLATE CATEGORIES
// ==========================================

export const TEMPLATE_CATEGORIES = [
  { value: "intake", label: "Intake Forms" },
  { value: "consent", label: "Consent Forms" },
  { value: "agreement", label: "Service Agreements" },
  { value: "discharge", label: "Discharge Forms" },
  { value: "progress", label: "Progress Notes" },
  { value: "other", label: "Other" },
] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]["value"]

// ==========================================
// ICON OPTIONS (for template customization)
// ==========================================

export const TEMPLATE_ICONS = [
  "FileText",
  "ClipboardList",
  "FileSignature",
  "Users",
  "Heart",
  "Shield",
  "Award",
  "Target",
  "CheckCircle",
  "AlertCircle",
  "Info",
  "BookOpen",
] as const

export type TemplateIcon = (typeof TEMPLATE_ICONS)[number]

// ==========================================
// STATUS CONFIGURATION
// ==========================================

export const TEMPLATE_STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "bg-gray-100 text-gray-700",
    description: "Template is being edited",
  },
  active: {
    label: "Active",
    color: "bg-emerald-100 text-emerald-700",
    description: "Template is ready for use",
  },
  archived: {
    label: "Archived",
    color: "bg-amber-100 text-amber-700",
    description: "Template is no longer in use",
  },
} as const

export const AGREEMENT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-gray-100 text-gray-700",
    description: "Waiting to be sent",
  },
  sent: {
    label: "Sent",
    color: "bg-blue-100 text-blue-700",
    description: "Sent to signers",
  },
  partially_signed: {
    label: "Partially Signed",
    color: "bg-amber-100 text-amber-700",
    description: "Some signatures collected",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700",
    description: "All signatures collected",
  },
  voided: {
    label: "Voided",
    color: "bg-red-100 text-red-700",
    description: "Agreement cancelled",
  },
} as const

// Agreement status with hex colors for inline styles (badges, etc.)
export const AGREEMENT_STATUS = {
  sent: { label: "Sent", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" },
  viewed: { label: "Viewed", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
  partially_signed: { label: "Partially Signed", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
  completed: { label: "Completed", color: "#22C55E", bg: "rgba(34, 197, 94, 0.1)" },
  declined: { label: "Declined", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  expired: { label: "Expired", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" },
  voided: { label: "Voided", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" },
} as const

export type AgreementStatusKey = keyof typeof AGREEMENT_STATUS
