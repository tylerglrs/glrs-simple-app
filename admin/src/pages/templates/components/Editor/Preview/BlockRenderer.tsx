// ==========================================
// BLOCK RENDERER COMPONENT
// ==========================================
//
// Renders all 14 block types for document preview.
// CRITICAL: Output must match /shared/block-renderer.js exactly
// for WYSIWYG consistency between admin editor and sign.html.
//
// @version 1.0.0
// @date 2025-11-28

import { cn } from "@/lib/utils"
import type {
  Block,
  SectionBlock,
  HeadingBlock,
  ParagraphBlock,
  BulletListBlock,
  SignatureFieldBlock,
  InitialsFieldBlock,
  DateFieldBlock,
  TextInputFieldBlock,
  CheckboxFieldBlock,
  DropdownFieldBlock,
  SignatureBlockLegacy,
  AcknowledgmentBlock,
  SignerRole,
} from "../../../types"
import { SIGNER_ROLES } from "../../../constants"

// ==========================================
// ROLE STYLING HELPER
// ==========================================

function getRoleStyles(role: SignerRole) {
  const roleConfig = SIGNER_ROLES[role]
  return {
    borderColor: roleConfig?.borderColor || "#e5e7eb",
    bgColor: roleConfig?.bgLight || "#f9fafb",
    label: roleConfig?.fullLabel || role.toUpperCase(),
  }
}

// ==========================================
// STRUCTURE BLOCK RENDERERS
// ==========================================

interface SectionRendererProps {
  block: SectionBlock
}

function SectionRenderer({ block }: SectionRendererProps) {
  return (
    <div className="mb-4 border-b-2 border-slate-300 pb-2">
      <div className="flex items-baseline gap-3">
        {block.number && (
          <span className="text-lg font-bold text-slate-700">
            {block.number}.
          </span>
        )}
        <h2 className="text-lg font-bold uppercase tracking-wide text-slate-800">
          {block.title || "Untitled Section"}
        </h2>
      </div>
    </div>
  )
}

interface HeadingRendererProps {
  block: HeadingBlock
}

function HeadingRenderer({ block }: HeadingRendererProps) {
  const level = block.level || 2
  const content = block.content || "Untitled"

  const baseClasses = "font-semibold text-slate-800"
  const levelClasses = {
    1: "text-xl mb-3",
    2: "text-lg mb-2",
    3: "text-base mb-2",
    4: "text-sm mb-1",
  }

  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return (
    <Tag className={cn(baseClasses, levelClasses[level])}>
      {content}
    </Tag>
  )
}

function PageBreakRenderer() {
  return (
    <div className="my-4 flex items-center gap-2 text-xs text-slate-400">
      <div className="h-px flex-1 border-t border-dashed border-slate-300" />
      <span>Page Break</span>
      <div className="h-px flex-1 border-t border-dashed border-slate-300" />
    </div>
  )
}

// ==========================================
// CONTENT BLOCK RENDERERS
// ==========================================

interface ParagraphRendererProps {
  block: ParagraphBlock
}

function ParagraphRenderer({ block }: ParagraphRendererProps) {
  return (
    <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
      {block.content || ""}
    </p>
  )
}

interface BulletListRendererProps {
  block: BulletListBlock
}

function BulletListRenderer({ block }: BulletListRendererProps) {
  const items = block.items || []
  if (items.length === 0) {
    return <div className="mb-3 text-sm italic text-slate-400">No items</div>
  }

  return (
    <ul className="mb-3 list-disc space-y-1 pl-6 text-sm text-slate-700">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  )
}

// ==========================================
// SIGNATURE FIELD RENDERERS
// ==========================================

interface SignatureFieldRendererProps {
  block: SignatureFieldBlock
}

function SignatureFieldRenderer({ block }: SignatureFieldRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {block.label || "Signature"}
          {block.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
      <div
        className="h-12 rounded border border-dashed"
        style={{ borderColor }}
      />
    </div>
  )
}

interface InitialsFieldRendererProps {
  block: InitialsFieldBlock
}

function InitialsFieldRenderer({ block }: InitialsFieldRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {block.label || "Initials"}
          {block.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
      <div
        className="flex h-10 w-20 items-center justify-center rounded border border-dashed text-slate-400"
        style={{ borderColor }}
      >
        __
      </div>
    </div>
  )
}

interface DateFieldRendererProps {
  block: DateFieldBlock
}

function DateFieldRenderer({ block }: DateFieldRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {block.label || "Date"}
          {block.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
      <div
        className="flex h-8 w-40 items-center rounded border px-2 text-sm text-slate-400"
        style={{ borderColor }}
      >
        {block.autoFill ? new Date().toLocaleDateString() : "MM/DD/YYYY"}
      </div>
    </div>
  )
}

interface TextInputFieldRendererProps {
  block: TextInputFieldBlock
}

function TextInputFieldRenderer({ block }: TextInputFieldRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {block.label || "Text Input"}
          {block.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
      <div
        className="h-8 rounded border px-2 text-sm leading-8 text-slate-400"
        style={{ borderColor }}
      >
        {block.placeholder || "Enter text..."}
      </div>
    </div>
  )
}

interface CheckboxFieldRendererProps {
  block: CheckboxFieldBlock
}

function CheckboxFieldRenderer({ block }: CheckboxFieldRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-5 w-5 items-center justify-center rounded border-2"
          style={{ borderColor }}
        />
        <span className="text-sm text-slate-700">
          {block.label || "Checkbox"}
          {block.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span
          className="ml-auto rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

interface DropdownFieldRendererProps {
  block: DropdownFieldBlock
}

function DropdownFieldRenderer({ block }: DropdownFieldRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)
  const options = block.options || []

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {block.label || "Select Option"}
          {block.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
      <div
        className="flex h-8 items-center justify-between rounded border px-2 text-sm text-slate-500"
        style={{ borderColor }}
      >
        <span>{options.length > 0 ? options[0] : "Select..."}</span>
        <span className="text-slate-400">v</span>
      </div>
    </div>
  )
}

// ==========================================
// LEGACY BLOCK RENDERERS
// ==========================================

interface SignatureBlockLegacyRendererProps {
  block: SignatureBlockLegacy
}

function SignatureBlockLegacyRenderer({ block }: SignatureBlockLegacyRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {block.label || "Signature (Legacy)"}
          {block.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <span
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
      <div
        className="h-12 rounded border border-dashed"
        style={{ borderColor }}
      />
    </div>
  )
}

interface AcknowledgmentRendererProps {
  block: AcknowledgmentBlock
}

function AcknowledgmentRenderer({ block }: AcknowledgmentRendererProps) {
  const { borderColor, bgColor, label } = getRoleStyles(block.role)

  return (
    <div
      className="mb-3 rounded border-2 p-3"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2"
          style={{ borderColor }}
        />
        <div className="flex-1">
          <p className="text-sm text-slate-700">
            {block.text || "Acknowledgment text"}
            {block.required && <span className="ml-1 text-red-500">*</span>}
          </p>
        </div>
        <span
          className="shrink-0 rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: borderColor, color: "white" }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

// ==========================================
// MAIN BLOCK RENDERER
// ==========================================

interface BlockRendererProps {
  block: Block
  index?: number
  className?: string
}

/**
 * Renders a single block based on its type.
 * Dispatches to type-specific renderers.
 */
export function BlockRenderer({ block, index, className }: BlockRendererProps) {
  const renderedBlock = (() => {
    switch (block.type) {
      // Structure blocks
      case "section":
        return <SectionRenderer block={block as SectionBlock} />
      case "heading":
        return <HeadingRenderer block={block as HeadingBlock} />
      case "pageBreak":
        return <PageBreakRenderer />

      // Content blocks
      case "paragraph":
        return <ParagraphRenderer block={block as ParagraphBlock} />
      case "bulletList":
        return <BulletListRenderer block={block as BulletListBlock} />

      // Signature fields
      case "signatureField":
        return <SignatureFieldRenderer block={block as SignatureFieldBlock} />
      case "initialsField":
        return <InitialsFieldRenderer block={block as InitialsFieldBlock} />
      case "dateField":
        return <DateFieldRenderer block={block as DateFieldBlock} />
      case "textInputField":
        return <TextInputFieldRenderer block={block as TextInputFieldBlock} />
      case "checkboxField":
        return <CheckboxFieldRenderer block={block as CheckboxFieldBlock} />
      case "dropdownField":
        return <DropdownFieldRenderer block={block as DropdownFieldBlock} />

      // Legacy blocks
      case "signatureBlock":
        return <SignatureBlockLegacyRenderer block={block as SignatureBlockLegacy} />
      case "acknowledgment":
        return <AcknowledgmentRenderer block={block as AcknowledgmentBlock} />

      default:
        return (
          <div className="mb-3 rounded border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
            Unknown block type: {(block as Block).type}
          </div>
        )
    }
  })()

  return (
    <div className={className} data-block-index={index}>
      {renderedBlock}
    </div>
  )
}

export default BlockRenderer
