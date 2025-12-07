// ==========================================
// DOCUMENT PAGINATION UTILITIES
// ==========================================
//
// CRITICAL: These functions MUST produce identical output to /shared/document-constants.js
// for WYSIWYG consistency between admin editor and sign.html
//
// This file ports the pagination logic from the shared .js file to TypeScript
// while maintaining 100% algorithmic compatibility.
//
// @version 1.0.0
// @date 2025-11-28

import type { Block, ParagraphBlock, BulletListBlock } from "../types"
import {
  BLOCK_HEIGHTS,
  DEFAULT_BLOCK_HEIGHT,
  TYPOGRAPHY,
  USABLE_HEIGHT,
} from "./documentConstants"

// ==========================================
// BLOCK HEIGHT CALCULATION
// ==========================================

/**
 * Calculate the height of a block in pixels.
 *
 * For most blocks, returns the fixed height from BLOCK_HEIGHTS.
 * For paragraph and bulletList, calculates dynamic height based on content.
 *
 * CRITICAL: This must match getBlockHeight() in /shared/document-constants.js
 *
 * @param block - The block to measure
 * @returns Height in pixels
 */
export function getBlockHeight(block: Block): number {
  // Dynamic height for paragraph blocks
  if (block.type === "paragraph") {
    const paragraphBlock = block as ParagraphBlock
    const text = paragraphBlock.content || ""
    const lines = Math.ceil(text.length / TYPOGRAPHY.charsPerLine)
    const calcHeight = TYPOGRAPHY.paragraphBase + lines * TYPOGRAPHY.lineHeight
    return Math.max(calcHeight, TYPOGRAPHY.paragraphBase)
  }

  // Dynamic height for bullet list blocks
  if (block.type === "bulletList") {
    const bulletBlock = block as BulletListBlock
    const itemCount = (bulletBlock.items || []).length
    // Each item gets lineHeight + 8px spacing
    return TYPOGRAPHY.paragraphBase + itemCount * (TYPOGRAPHY.lineHeight + 8)
  }

  // Fixed height for all other block types
  return BLOCK_HEIGHTS[block.type] ?? DEFAULT_BLOCK_HEIGHT
}

// ==========================================
// PAGINATION OPTIONS
// ==========================================

export interface PaginationOptions {
  /** Height available for content on each page (default: USABLE_HEIGHT) */
  usableHeight?: number
  /** Whether to include debug info (default: false) */
  debug?: boolean
}

export interface PaginationResult {
  /** Array of pages, each containing an array of blocks */
  pages: Block[][]
  /** Total number of pages */
  pageCount: number
  /** Debug info if enabled */
  debugInfo?: {
    blockHeights: { blockId: string; type: string; height: number }[]
    pageHeights: number[]
  }
}

// ==========================================
// PAGINATION ALGORITHM
// ==========================================

/**
 * Distribute blocks across pages based on available height.
 *
 * CRITICAL: This algorithm MUST match paginateBlocks() in /shared/document-constants.js
 *
 * Algorithm:
 * 1. Start with empty first page
 * 2. For each block:
 *    - If pageBreak: start new page (don't add block to content)
 *    - Calculate block height
 *    - If block would overflow AND current page has content: start new page
 *    - Add block to current page
 *    - Track cumulative height
 *
 * @param blocks - Array of blocks to paginate
 * @param options - Pagination options
 * @returns Paginated result with pages array
 */
export function paginateBlocks(
  blocks: Block[],
  options: PaginationOptions = {}
): PaginationResult {
  const usableHeight = options.usableHeight ?? USABLE_HEIGHT
  const debug = options.debug ?? false

  const pages: Block[][] = [[]]
  let currentPageHeight = 0
  let currentPageIndex = 0

  // Debug tracking
  const blockHeights: { blockId: string; type: string; height: number }[] = []
  const pageHeights: number[] = []

  blocks.forEach((block) => {
    // Special handling for page breaks
    if (block.type === "pageBreak") {
      // Record current page height before moving to next
      if (debug) {
        pageHeights[currentPageIndex] = currentPageHeight
      }

      // Start new page
      currentPageIndex++
      pages.push([])
      currentPageHeight = 0

      // Don't add pageBreak block to page content
      return
    }

    // Calculate block height
    const blockHeight = getBlockHeight(block)

    if (debug) {
      blockHeights.push({
        blockId: block.id,
        type: block.type,
        height: blockHeight,
      })
    }

    // Check if block would overflow current page
    const wouldOverflow = currentPageHeight + blockHeight > usableHeight

    // If overflow AND current page has content, start new page
    if (wouldOverflow && pages[currentPageIndex].length > 0) {
      // Record current page height before moving
      if (debug) {
        pageHeights[currentPageIndex] = currentPageHeight
      }

      currentPageIndex++
      pages.push([])
      currentPageHeight = 0
    }

    // Add block to current page
    pages[currentPageIndex].push(block)
    currentPageHeight += blockHeight
  })

  // Record final page height
  if (debug) {
    pageHeights[currentPageIndex] = currentPageHeight
  }

  const result: PaginationResult = {
    pages,
    pageCount: pages.length,
  }

  if (debug) {
    result.debugInfo = {
      blockHeights,
      pageHeights,
    }
  }

  return result
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Calculate total height of an array of blocks.
 * Useful for preview calculations.
 */
export function calculateTotalHeight(blocks: Block[]): number {
  return blocks.reduce((total, block) => total + getBlockHeight(block), 0)
}

/**
 * Check if blocks would fit on a single page.
 */
export function wouldFitOnSinglePage(
  blocks: Block[],
  usableHeight: number = USABLE_HEIGHT
): boolean {
  return calculateTotalHeight(blocks) <= usableHeight
}

/**
 * Get page index for a specific block.
 * Returns -1 if block not found.
 */
export function getBlockPageIndex(
  blocks: Block[],
  blockId: string,
  usableHeight: number = USABLE_HEIGHT
): number {
  const { pages } = paginateBlocks(blocks, { usableHeight })

  for (let i = 0; i < pages.length; i++) {
    if (pages[i].some((block) => block.id === blockId)) {
      return i
    }
  }

  return -1
}
