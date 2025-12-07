// ==========================================
// TEMPLATES PAGE TYPES
// ==========================================

import { Timestamp } from "firebase/firestore"

// ==========================================
// BLOCK TYPES
// ==========================================

export type BlockCategory = "structure" | "content" | "signature" | "legacy"

export type BlockType =
  // Structure blocks
  | "section"
  | "heading"
  | "pageBreak"
  // Content blocks
  | "paragraph"
  | "bulletList"
  // Signature field types
  | "signatureField"
  | "initialsField"
  | "dateField"
  | "textInputField"
  | "checkboxField"
  | "dropdownField"
  // Legacy blocks
  | "signatureBlock"
  | "acknowledgment"

export type SignerRole = "pir" | "family" | "glrs"

export interface BlockDefinition {
  type: BlockType
  label: string
  icon: string
  category: BlockCategory
  defaultProps: Record<string, unknown>
}

export interface SignerRoleDefinition {
  label: string
  fullLabel: string
  color: string
  bgLight: string
  bgMedium: string
  borderColor: string
}

// ==========================================
// BLOCK INSTANCES (in templates/documents)
// ==========================================

export interface BaseBlock {
  id: string
  type: BlockType
}

export interface SectionBlock extends BaseBlock {
  type: "section"
  title: string
  number: string
}

export interface HeadingBlock extends BaseBlock {
  type: "heading"
  content: string
  level: 1 | 2 | 3 | 4
}

export interface PageBreakBlock extends BaseBlock {
  type: "pageBreak"
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph"
  content: string
}

export interface BulletListBlock extends BaseBlock {
  type: "bulletList"
  items: string[]
}

export interface SignatureFieldBlock extends BaseBlock {
  type: "signatureField"
  label: string
  role: SignerRole
  required: boolean
  fieldType: "signature"
}

export interface InitialsFieldBlock extends BaseBlock {
  type: "initialsField"
  label: string
  role: SignerRole
  required: boolean
  fieldType: "initials"
}

export interface DateFieldBlock extends BaseBlock {
  type: "dateField"
  label: string
  role: SignerRole
  required: boolean
  fieldType: "date"
  autoFill?: boolean
}

export interface TextInputFieldBlock extends BaseBlock {
  type: "textInputField"
  label: string
  role: SignerRole
  required: boolean
  fieldType: "textInput"
  placeholder?: string
  maxLength?: number
}

export interface CheckboxFieldBlock extends BaseBlock {
  type: "checkboxField"
  label: string
  role: SignerRole
  required: boolean
  fieldType: "checkbox"
}

export interface DropdownFieldBlock extends BaseBlock {
  type: "dropdownField"
  label: string
  role: SignerRole
  required: boolean
  fieldType: "dropdown"
  options: string[]
}

// Legacy blocks (backward compatibility)
export interface SignatureBlockLegacy extends BaseBlock {
  type: "signatureBlock"
  label: string
  role: SignerRole
  required: boolean
}

export interface AcknowledgmentBlock extends BaseBlock {
  type: "acknowledgment"
  text: string
  required: boolean
  role: SignerRole
}

export type Block =
  | SectionBlock
  | HeadingBlock
  | PageBreakBlock
  | ParagraphBlock
  | BulletListBlock
  | SignatureFieldBlock
  | InitialsFieldBlock
  | DateFieldBlock
  | TextInputFieldBlock
  | CheckboxFieldBlock
  | DropdownFieldBlock
  | SignatureBlockLegacy
  | AcknowledgmentBlock

// ==========================================
// TEMPLATES
// ==========================================

export type TemplateType =
  | "document"
  | "cover"
  | "header"
  | "footer"
  | "endPage"
  | "uploaded"

export type TemplateStatus = "draft" | "active" | "archived"

export interface UploadedPage {
  pageNumber: number
  imageUrl: string
  width: number
  height: number
}

export interface OverlayField {
  id: string
  type: BlockType
  label: string
  role: SignerRole
  required: boolean
  pageIndex: number
  x: number // percentage
  y: number // percentage
  width: number // percentage
  height: number // percentage
}

export interface TemplateComponents {
  coverPageId?: string
  headerId?: string
  footerId?: string
  endPageId?: string
}

export interface TemplateContent {
  blocks: Block[]
}

export interface UploadedFileInfo {
  type: "pdf" | "docx"
  originalName: string
  pages: UploadedPage[]
}

export interface Template {
  id: string
  name: string
  description?: string
  type: TemplateType
  status: TemplateStatus
  category?: string
  icon?: string
  iconColor?: string
  tenantId: string
  createdBy: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  // For document templates
  content?: TemplateContent
  components?: TemplateComponents
  // For uploaded templates
  uploadedFile?: UploadedFileInfo
  overlayFields?: OverlayField[]
}

// ==========================================
// AGREEMENTS (E-SIGNATURE)
// ==========================================

export type AgreementStatus =
  | "pending"
  | "sent"
  | "viewed"
  | "partially_signed"
  | "completed"
  | "declined"
  | "expired"
  | "voided"

export interface Signer {
  role: SignerRole
  name: string
  email: string | null // null for GLRS (signs in portal)
  token: string // unique token for signing link
  status: "pending" | "signed"
  order: number
  signedAt?: Timestamp | Date | null
  signedFields?: string[]
  signature?: string // base64 data URL
  ipAddress?: string
}

// Form data for signer input in SendForSignatureModal
export interface SignerFormData {
  name: string
  email: string
  order: number
}

// Signing link returned after agreement creation
export interface SigningLink {
  role: SignerRole
  name: string
  email: string | null
  link: string
}

// Audit trail entry for agreements
export interface AuditTrailEntry {
  timestamp: string
  action: "sent" | "viewed" | "signed" | "email_sent" | "pdf_generated" | "voided"
  actor: string
  actorRole?: SignerRole | "glrs" | "system"
  recipients?: string[]
  emailType?: string
  recipient?: string
  ipAddress?: string
  pdfUrl?: string
}

export interface SignatureData {
  dataUrl: string
  signedAt: Timestamp | Date
  ipAddress?: string
}

export interface Agreement {
  id: string
  templateId: string
  documentTitle: string
  status: AgreementStatus

  // Snapshot of template content at time of sending
  content?: TemplateContent
  components?: TemplateComponents

  // Signers
  signerTokens: string[] // for querying
  signers: Signer[]

  // Field values (empty initially, filled during signing)
  fieldValues: Record<string, unknown>

  // Audit trail
  auditTrail: AuditTrailEntry[]

  // Metadata
  expiresAt?: Timestamp | Date
  tenantId: string
  createdBy: string
  createdAt: Timestamp | Date
  sentAt?: Timestamp | Date
  completedAt?: Timestamp | Date | null

  // PDF storage
  pdfUrl?: string

  // For linking to PIR (optional)
  pirId?: string
  pirName?: string
  pirEmail?: string
}

// Result from SendForSignatureModal after agreement creation
export interface SendAgreementResult {
  id: string
  documentTitle: string
  status: AgreementStatus
  signingLinks: SigningLink[]
}

// ==========================================
// UI STATE TYPES
// ==========================================

export interface TemplateFilters {
  search: string
  category: string
  status: TemplateStatus | "all"
  type: TemplateType | "all"
}

export interface AgreementFilters {
  search: string
  status: AgreementStatus | "all"
  dateRange?: {
    start: Date
    end: Date
  }
}

export type EditorMode = "edit" | "preview"

export interface EditorState {
  selectedBlockId: string | null
  mode: EditorMode
  isDragging: boolean
  hasUnsavedChanges: boolean
}

// ==========================================
// TAB CONFIGURATION
// ==========================================

export interface Tab {
  id: string
  label: string
}

export const TABS: Tab[] = [
  { id: "templates", label: "Templates" },
  { id: "agreements", label: "Agreements" },
]
