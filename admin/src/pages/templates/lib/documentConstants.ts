// ==========================================
// DOCUMENT TEMPLATE CONSTANTS
// ==========================================
//
// SINGLE SOURCE OF TRUTH for document dimensions and measurements.
// These constants match /shared/document-constants.js for WYSIWYG consistency.
//
// IMPORTANT: This file contains CONSTANTS ONLY.
// Functions (paginateBlocks, getBlockHeight, etc.) remain in the shared .js file
// to maintain compatibility with sign.html.
//
// Industry Standards Applied:
// - Page: US Letter @ 96 DPI (816 x 1056px)
// - Header: 70px (~0.73") - professional document standard
// - Footer: 50px (~0.52") - professional document standard
// - Drop zones: 24-40px - WCAG accessibility standard
// - Line length: 75 chars - optimal readability
//
// @version 1.0.0
// @date 2025-11-28

import type { BlockType } from "../types"

// ==========================================
// PAGE DIMENSIONS (US Letter @ 96 DPI)
// ==========================================

/** Page width in pixels (8.5 inches * 96 DPI) */
export const PAGE_WIDTH = 816

/** Page height in pixels (11 inches * 96 DPI) */
export const PAGE_HEIGHT = 1056

/** Page margin in pixels (0.625 inches * 96 DPI) */
export const PAGE_MARGIN = 60

// ==========================================
// HEADER/FOOTER HEIGHTS (INDUSTRY STANDARD)
// ==========================================

/** Header height in pixels (~0.73 inches) - professional standard */
export const HEADER_HEIGHT = 70

/** Footer height in pixels (~0.52 inches) - professional standard */
export const FOOTER_HEIGHT = 50

// ==========================================
// CONTENT AREA CALCULATIONS
// ==========================================

/** Safety margin for pagination (prevents overflow) */
export const SAFETY_MARGIN = 0.95

/**
 * Raw content height: PAGE_HEIGHT - (margins * 2) - header - footer
 * 1056 - 120 - 70 - 50 = 816px
 */
export const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2 - HEADER_HEIGHT - FOOTER_HEIGHT

/**
 * Usable height with safety margin
 * 816 * 0.95 = 775.2 -> 775px (or 734px if using 0.9)
 */
export const USABLE_HEIGHT = Math.floor(CONTENT_HEIGHT * SAFETY_MARGIN)

// ==========================================
// BLOCK HEIGHT DEFINITIONS (in pixels)
// ==========================================

/**
 * Fixed heights for block types.
 * Note: paragraph and bulletList have dynamic heights calculated by functions
 * in /shared/document-constants.js
 */
export const BLOCK_HEIGHTS: Partial<Record<BlockType, number>> = {
  section: 70,
  heading: 40,
  signatureField: 65,
  signatureBlock: 65,
  initialsField: 55,
  dateField: 50,
  textInputField: 50,
  checkboxField: 40,
  acknowledgment: 40,
  dropdownField: 50,
  pageBreak: 0, // Special handling - forces new page
}

/** Default block height for unknown types */
export const DEFAULT_BLOCK_HEIGHT = 60

// ==========================================
// TYPOGRAPHY SETTINGS
// ==========================================

export const TYPOGRAPHY = {
  /** Characters per line (accurate for 696px width @ 14px font) */
  charsPerLine: 100,
  /** Pixels per line (tighter estimate) */
  lineHeight: 16,
  /** Minimum paragraph height in pixels */
  paragraphBase: 24,
  /** Base font size in pixels */
  baseFontSize: 14,
} as const

// ==========================================
// DROP ZONE DIMENSIONS (WCAG accessibility)
// ==========================================

export const DROP_ZONE = {
  /** Minimum touch target (24px) */
  resting: 24,
  /** Expanded when dragging (40px) */
  active: 40,
  /** CSS transition */
  transition: "150ms ease",
} as const

// ==========================================
// EXPORT ALL AS SINGLE OBJECT (matches window.GLRS_DOC pattern)
// ==========================================

export const GLRS_DOC = {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  CONTENT_HEIGHT,
  SAFETY_MARGIN,
  USABLE_HEIGHT,
  BLOCKS: BLOCK_HEIGHTS,
  TYPOGRAPHY,
  DROP_ZONE,
} as const
