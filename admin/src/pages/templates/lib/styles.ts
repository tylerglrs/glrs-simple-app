// ==========================================
// DOCUMENT TEMPLATE STYLES
// ==========================================
//
// SINGLE SOURCE OF TRUTH for block rendering styles.
// These styles match /shared/block-styles.js for WYSIWYG consistency.
//
// Industry Standard: CKEditor "content styles" pattern
// - Editor and output share identical styling
// - Ensures what users see in editor matches final output
//
// @version 1.0.0
// @date 2025-11-28

import type { CSSProperties } from "react"
import type { BlockType } from "../types"

// ==========================================
// DESIGN TOKENS (COLORS)
// ==========================================

export const COLORS = {
  primary: "#0077CC",
  primaryDark: "#005A9C",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  gradient: "linear-gradient(135deg, #0077CC 0%, #005A9C 100%)",
} as const

// ==========================================
// TYPOGRAPHY SETTINGS
// ==========================================

export const TYPOGRAPHY = {
  baseFontSize: 14,
  lineHeight: 1.7,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
} as const

// ==========================================
// CONTENT BLOCK STYLES
// ==========================================

interface SectionStyleOptions {
  index?: number
}

interface SectionStyles {
  container: CSSProperties
  numberBadge: CSSProperties
}

/**
 * Section block style
 */
export function getSectionStyle(options: SectionStyleOptions = {}): SectionStyles {
  const { index = 0 } = options
  return {
    container: {
      fontWeight: 700,
      fontSize: "16px",
      color: COLORS.primary,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginTop: index > 0 ? "28px" : "16px",
      marginBottom: "14px",
      paddingTop: "14px",
      paddingBottom: "10px",
      borderTop: index > 0 ? `2px solid ${COLORS.gray200}` : "none",
      borderBottom: `2px solid ${COLORS.primary}`,
      background: "linear-gradient(to bottom, rgba(0,119,204,0.05), transparent)",
    },
    numberBadge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: COLORS.primary,
      color: "white",
      fontSize: "12px",
      fontWeight: 700,
      marginRight: "10px",
    },
  }
}

/**
 * Heading block styles by level (h1-h4)
 */
export const HEADING_STYLES: Record<1 | 2 | 3 | 4, CSSProperties> = {
  1: { fontSize: "22px", fontWeight: 700, marginTop: "24px", marginBottom: "12px", color: COLORS.gray900 },
  2: { fontSize: "18px", fontWeight: 700, marginTop: "20px", marginBottom: "10px", color: COLORS.gray800 },
  3: { fontSize: "15px", fontWeight: 700, marginTop: "16px", marginBottom: "8px", color: COLORS.gray700 },
  4: { fontSize: "13px", fontWeight: 600, marginTop: "14px", marginBottom: "6px", color: COLORS.gray700 },
}

/**
 * Get heading style by level
 */
export function getHeadingStyle(level: 1 | 2 | 3 | 4 = 3): CSSProperties {
  return HEADING_STYLES[level] || HEADING_STYLES[3]
}

/**
 * Paragraph block style
 */
export const PARAGRAPH_STYLE: CSSProperties = {
  fontSize: "13px",
  color: COLORS.gray600,
  lineHeight: 1.7,
  marginBottom: "12px",
  textAlign: "justify",
}

/**
 * Bullet list styles
 */
export const BULLET_LIST_STYLES = {
  container: {
    paddingLeft: "24px",
    marginBottom: "12px",
    fontSize: "13px",
    color: COLORS.gray600,
    lineHeight: 1.7,
  } as CSSProperties,
  item: {
    marginBottom: "6px",
  } as CSSProperties,
}

/**
 * Divider style
 */
export const DIVIDER_STYLE: CSSProperties = {
  height: "1px",
  background: `linear-gradient(to right, transparent, ${COLORS.gray300}, transparent)`,
  margin: "24px 0",
}

/**
 * Page break indicator style (editor only)
 */
export const PAGE_BREAK_STYLE = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
    margin: "8px 0",
  } as CSSProperties,
  line: {
    flex: 1,
    height: "2px",
    background: `repeating-linear-gradient(90deg, ${COLORS.gray300} 0px, ${COLORS.gray300} 8px, transparent 8px, transparent 16px)`,
  } as CSSProperties,
  label: {
    fontSize: "11px",
    color: COLORS.gray400,
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as CSSProperties,
}

// ==========================================
// FIELD BLOCK STYLES
// ==========================================

/**
 * Field label style (common to all fields)
 */
export const FIELD_LABEL_STYLE: CSSProperties = {
  fontSize: "12px",
  color: COLORS.gray500,
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
}

/**
 * Required asterisk style
 */
export const REQUIRED_STYLE: CSSProperties = {
  color: COLORS.error,
}

interface SignatureBoxOptions {
  type?: "signatureField" | "initialsField" | "signatureBlock"
  isCompleted?: boolean
  borderColor?: string
}

/**
 * Signature/Initials field box style
 */
export function getSignatureBoxStyle(options: SignatureBoxOptions = {}): CSSProperties {
  const { type = "signatureField", isCompleted = false, borderColor = COLORS.gray300 } = options
  return {
    height: type === "initialsField" ? "50px" : "60px",
    border: `2px dashed ${isCompleted ? borderColor : COLORS.gray300}`,
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isCompleted ? "white" : "transparent",
  }
}

/**
 * Placeholder text style (for empty signature boxes)
 */
export const PLACEHOLDER_STYLE: CSSProperties = {
  color: COLORS.gray400,
  fontSize: "14px",
}

interface InputStyleOptions {
  isEditable?: boolean
}

/**
 * Input field style (date, text, dropdown)
 */
export function getInputStyle(options: InputStyleOptions = {}): CSSProperties {
  const { isEditable = true } = options
  return {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: "4px",
    fontSize: "14px",
    background: isEditable ? "white" : COLORS.gray100,
  }
}

interface CheckboxStyleOptions {
  isChecked?: boolean
  borderColor?: string
}

interface CheckboxStyles {
  box: CSSProperties
  label: CSSProperties
}

/**
 * Checkbox container style
 */
export function getCheckboxStyle(options: CheckboxStyleOptions = {}): CheckboxStyles {
  const { isChecked = false, borderColor = COLORS.gray300 } = options
  return {
    box: {
      width: "20px",
      height: "20px",
      border: `2px solid ${isChecked ? borderColor : COLORS.gray300}`,
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: isChecked ? borderColor : "white",
      flexShrink: 0,
    },
    label: {
      fontSize: "14px",
      color: COLORS.gray700,
      lineHeight: 1.5,
    },
  }
}

interface RoleBadgeOptions {
  bgLight?: string
  color?: string
}

/**
 * Role badge style (shown on fields for non-current signer)
 */
export function getRoleBadgeStyle(options: RoleBadgeOptions = {}): CSSProperties {
  const { bgLight = COLORS.gray100, color = COLORS.gray600 } = options
  return {
    position: "absolute",
    top: "8px",
    right: "8px",
    padding: "2px 8px",
    background: bgLight,
    color: color,
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 600,
  }
}

interface FieldWrapperOptions {
  borderColor?: string
  bgLight?: string
  isEditable?: boolean
}

/**
 * Field wrapper base style (for sign.html FieldRenderer)
 */
export function getFieldWrapperStyle(options: FieldWrapperOptions = {}): CSSProperties {
  const { borderColor = COLORS.primary, bgLight = "rgba(0,119,204,0.05)", isEditable = true } = options
  return {
    position: "relative",
    padding: "12px 16px",
    borderLeft: `4px solid ${borderColor}`,
    background: isEditable ? bgLight : COLORS.gray50,
    borderRadius: "0 8px 8px 0",
    cursor: isEditable ? "pointer" : "default",
    opacity: isEditable ? 1 : 0.7,
    marginBottom: "12px",
    transition: "all 200ms ease",
  }
}

// ==========================================
// EDITOR-SPECIFIC STYLES
// ==========================================

interface CanvasBlockOptions {
  isSelected?: boolean
  isDragging?: boolean
  previewMode?: boolean
}

/**
 * Canvas block wrapper style (templates.html)
 */
export function getCanvasBlockStyle(options: CanvasBlockOptions = {}): CSSProperties {
  const { isSelected = false, isDragging = false, previewMode = false } = options
  return {
    position: "relative",
    background: "white",
    borderRadius: "4px",
    cursor: previewMode ? "default" : isDragging ? "grabbing" : "pointer",
    opacity: isDragging ? 0.5 : 1,
    transform: isDragging ? "scale(0.98)" : "scale(1)",
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
    transition: "opacity 150ms ease, transform 150ms ease, box-shadow 150ms ease",
    outline: isSelected && !previewMode ? `2px solid ${COLORS.primary}` : "none",
    outlineOffset: "2px",
  }
}

/**
 * Block type indicator style (editor toolbar on hover)
 */
export const BLOCK_TYPE_INDICATOR_STYLE: CSSProperties = {
  position: "absolute",
  top: "4px",
  right: "4px",
  fontSize: "10px",
  color: COLORS.gray400,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}

/**
 * Delete button style (hover action)
 */
export const DELETE_BUTTON_STYLE: CSSProperties = {
  position: "absolute",
  top: "4px",
  right: "24px",
  width: "20px",
  height: "20px",
  borderRadius: "4px",
  background: COLORS.error,
  color: "white",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  opacity: 0.8,
  transition: "opacity 150ms ease",
}

// ==========================================
// HEADER/FOOTER STYLES
// ==========================================

interface PageHeaderStyles {
  container: CSSProperties
  logoContainer: CSSProperties
  logoIcon: CSSProperties
  title: CSSProperties
  subtitle: CSSProperties
  pageNumber: CSSProperties
}

/**
 * Page header style
 */
export function getPageHeaderStyle(headerHeight = 70): PageHeaderStyles {
  return {
    container: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: `1px solid ${COLORS.gray200}`,
      marginBottom: "20px",
      minHeight: headerHeight - 20,
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoIcon: {
      width: "28px",
      height: "28px",
      background: COLORS.gradient,
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: "13px",
      fontWeight: 600,
      color: COLORS.gray900,
    },
    subtitle: {
      fontSize: "10px",
      color: COLORS.gray500,
    },
    pageNumber: {
      fontSize: "11px",
      color: COLORS.gray500,
    },
  }
}

interface PageFooterStyles {
  container: CSSProperties
  pageNumber: CSSProperties
}

/**
 * Page footer style
 */
export function getPageFooterStyle(footerHeight = 50): PageFooterStyles {
  return {
    container: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderTop: `1px solid ${COLORS.gray200}`,
      marginTop: "auto",
      minHeight: footerHeight - 12,
      fontSize: "10px",
      color: COLORS.gray500,
    },
    pageNumber: {
      fontWeight: 500,
    },
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

interface BlockStyleOptions {
  index?: number
  level?: 1 | 2 | 3 | 4
  type?: "signatureField" | "initialsField" | "signatureBlock"
  isCompleted?: boolean
  isChecked?: boolean
  isEditable?: boolean
  borderColor?: string
}

/**
 * Get styles for a specific block type
 * Returns a record of named style objects for the given block type
 */
export function getBlockStyles(blockType: BlockType, options: BlockStyleOptions = {}): Record<string, CSSProperties> {
  switch (blockType) {
    case "section":
      return getSectionStyle(options) as unknown as Record<string, CSSProperties>
    case "heading":
      return { style: getHeadingStyle(options.level) }
    case "paragraph":
      return { style: PARAGRAPH_STYLE }
    case "bulletList":
      return BULLET_LIST_STYLES
    case "pageBreak":
      return PAGE_BREAK_STYLE
    case "signatureField":
    case "initialsField":
    case "signatureBlock":
      return {
        label: FIELD_LABEL_STYLE,
        box: getSignatureBoxStyle(options),
        placeholder: PLACEHOLDER_STYLE,
      }
    case "dateField":
    case "textInputField":
      return {
        label: FIELD_LABEL_STYLE,
        input: getInputStyle(options),
      }
    case "checkboxField":
    case "acknowledgment":
      return {
        ...getCheckboxStyle(options),
        labelStyle: FIELD_LABEL_STYLE,
      }
    case "dropdownField":
      return {
        label: FIELD_LABEL_STYLE,
        select: getInputStyle(options),
      }
    default:
      return {}
  }
}

// ==========================================
// EXPORT ALL (matches window.GLRS_STYLES pattern)
// ==========================================

export const GLRS_STYLES = {
  COLORS,
  TYPOGRAPHY,
  getSectionStyle,
  HEADING_STYLES,
  getHeadingStyle,
  PARAGRAPH_STYLE,
  BULLET_LIST_STYLES,
  DIVIDER_STYLE,
  PAGE_BREAK_STYLE,
  FIELD_LABEL_STYLE,
  REQUIRED_STYLE,
  PLACEHOLDER_STYLE,
  getSignatureBoxStyle,
  getInputStyle,
  getCheckboxStyle,
  getRoleBadgeStyle,
  getFieldWrapperStyle,
  getCanvasBlockStyle,
  BLOCK_TYPE_INDICATOR_STYLE,
  DELETE_BUTTON_STYLE,
  getPageHeaderStyle,
  getPageFooterStyle,
  getBlockStyles,
} as const
