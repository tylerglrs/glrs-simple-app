/**
 * GLRS Document Template System - Shared Pagination
 *
 * SINGLE SOURCE OF TRUTH for all pagination logic.
 * This file is imported by both templates.html (editor) and sign.html (viewer)
 * to ensure WYSIWYG consistency.
 *
 * Dependencies:
 * - /shared/document-constants.js (GLRS_DOC)
 *
 * Core pagination functions delegate to GLRS_DOC for consistency.
 * This file adds pagination-specific helper functions.
 *
 * @version 1.0.0
 * @date 2025-11-27
 */

(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (!window.GLRS_DOC) {
        console.error('[GLRS_PAGINATION] GLRS_DOC not loaded. Load document-constants.js first.');
        return;
    }

    // ==========================================
    // BLOCK HEIGHT CALCULATIONS
    // ==========================================

    /**
     * Get height for a specific block type
     * Delegates to GLRS_DOC.getBlockHeight for consistency
     * @param {Object} block - Block data with type property
     * @returns {number} Height in pixels
     */
    function getBlockHeight(block) {
        return GLRS_DOC.getBlockHeight(block);
    }

    /**
     * Calculate paragraph height based on content length
     * Delegates to GLRS_DOC.getParagraphHeight for consistency
     * @param {string} content - Paragraph text content
     * @returns {number} Height in pixels
     */
    function getParagraphHeight(content) {
        return GLRS_DOC.getParagraphHeight(content);
    }

    /**
     * Calculate bullet list height based on item count
     * Delegates to GLRS_DOC.getBulletListHeight for consistency
     * @param {Array} items - Array of bullet items
     * @returns {number} Height in pixels
     */
    function getBulletListHeight(items) {
        return GLRS_DOC.getBulletListHeight(items);
    }

    // ==========================================
    // PAGE CALCULATIONS
    // ==========================================

    /**
     * Get usable content height for a page
     * Delegates to GLRS_DOC.getUsableContentHeight for consistency
     * @param {boolean} hasHeader - Whether page has header
     * @param {boolean} hasFooter - Whether page has footer
     * @returns {number} Usable height in pixels
     */
    function getUsableContentHeight(hasHeader, hasFooter) {
        if (hasHeader === undefined && hasFooter === undefined) {
            return GLRS_DOC.USABLE_HEIGHT;
        }
        return GLRS_DOC.getUsableContentHeight(hasHeader, hasFooter);
    }

    /**
     * Main pagination function - splits blocks into pages
     * Delegates to GLRS_DOC.paginateBlocks for consistency
     * @param {Array} blocks - Array of block objects
     * @param {number} usableHeight - Optional custom usable height
     * @returns {Array} Array of page arrays, each containing blocks
     */
    function paginateBlocks(blocks, usableHeight) {
        if (!blocks || !Array.isArray(blocks)) {
            return [[]];
        }
        return GLRS_DOC.paginateBlocks(blocks, usableHeight || GLRS_DOC.USABLE_HEIGHT);
    }

    // ==========================================
    // PAGINATION HELPER FUNCTIONS
    // ==========================================

    /**
     * Get the global start index for a specific page
     * Useful for calculating block indices across pages
     * @param {Array} pages - Array of page arrays from paginateBlocks()
     * @param {number} pageIndex - Zero-based page index
     * @returns {number} Starting block index for this page
     */
    function getPageStartIndex(pages, pageIndex) {
        if (!pages || !Array.isArray(pages) || pageIndex < 0) {
            return 0;
        }

        let startIndex = 0;
        for (let i = 0; i < pageIndex && i < pages.length; i++) {
            startIndex += pages[i].length;
        }
        return startIndex;
    }

    /**
     * Get total page count for a set of blocks
     * @param {Array} blocks - Array of block objects
     * @param {number} usableHeight - Optional custom usable height
     * @returns {number} Number of pages
     */
    function getPageCount(blocks, usableHeight) {
        return paginateBlocks(blocks, usableHeight).length;
    }

    /**
     * Get the page index that contains a specific block
     * @param {Array} blocks - Array of block objects
     * @param {number} blockIndex - Global block index
     * @param {number} usableHeight - Optional custom usable height
     * @returns {number} Page index (zero-based)
     */
    function getPageForBlock(blocks, blockIndex, usableHeight) {
        const pages = paginateBlocks(blocks, usableHeight);
        let currentIndex = 0;

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            const pageBlocks = pages[pageIndex];
            if (blockIndex < currentIndex + pageBlocks.length) {
                return pageIndex;
            }
            currentIndex += pageBlocks.length;
        }

        return pages.length - 1; // Return last page if not found
    }

    /**
     * Get the total height used on a specific page
     * @param {Array} pageBlocks - Array of blocks on a single page
     * @returns {number} Total height in pixels
     */
    function getPageUsedHeight(pageBlocks) {
        if (!pageBlocks || !Array.isArray(pageBlocks)) {
            return 0;
        }

        return pageBlocks.reduce((total, block) => {
            return total + getBlockHeight(block);
        }, 0);
    }

    /**
     * Get remaining available height on a specific page
     * @param {Array} pageBlocks - Array of blocks on a single page
     * @param {number} usableHeight - Optional custom usable height
     * @returns {number} Remaining height in pixels
     */
    function getPageRemainingHeight(pageBlocks, usableHeight) {
        const maxHeight = usableHeight || GLRS_DOC.USABLE_HEIGHT;
        const usedHeight = getPageUsedHeight(pageBlocks);
        return Math.max(0, maxHeight - usedHeight);
    }

    /**
     * Check if adding a block would overflow the page
     * @param {Array} pageBlocks - Current blocks on the page
     * @param {Object} newBlock - Block to add
     * @param {number} usableHeight - Optional custom usable height
     * @returns {boolean} True if block would overflow
     */
    function wouldOverflow(pageBlocks, newBlock, usableHeight) {
        const remainingHeight = getPageRemainingHeight(pageBlocks, usableHeight);
        const blockHeight = getBlockHeight(newBlock);
        return blockHeight > remainingHeight;
    }

    /**
     * Calculate pagination statistics for a document
     * @param {Array} blocks - Array of block objects
     * @param {number} usableHeight - Optional custom usable height
     * @returns {Object} Statistics object
     */
    function getPaginationStats(blocks, usableHeight) {
        const pages = paginateBlocks(blocks, usableHeight);
        const maxHeight = usableHeight || GLRS_DOC.USABLE_HEIGHT;

        const pageStats = pages.map((pageBlocks, index) => {
            const usedHeight = getPageUsedHeight(pageBlocks);
            return {
                pageIndex: index,
                blockCount: pageBlocks.length,
                usedHeight: usedHeight,
                remainingHeight: maxHeight - usedHeight,
                utilization: Math.round((usedHeight / maxHeight) * 100)
            };
        });

        return {
            totalPages: pages.length,
            totalBlocks: blocks.length,
            usableHeightPerPage: maxHeight,
            pages: pageStats,
            averageUtilization: Math.round(
                pageStats.reduce((sum, p) => sum + p.utilization, 0) / pages.length
            )
        };
    }

    // ==========================================
    // EXPORT TO GLOBAL NAMESPACE
    // ==========================================

    window.GLRS_PAGINATION = {
        // Core functions (delegate to GLRS_DOC)
        getBlockHeight: getBlockHeight,
        getParagraphHeight: getParagraphHeight,
        getBulletListHeight: getBulletListHeight,
        getUsableContentHeight: getUsableContentHeight,
        paginateBlocks: paginateBlocks,

        // Helper functions (new)
        getPageStartIndex: getPageStartIndex,
        getPageCount: getPageCount,
        getPageForBlock: getPageForBlock,
        getPageUsedHeight: getPageUsedHeight,
        getPageRemainingHeight: getPageRemainingHeight,
        wouldOverflow: wouldOverflow,
        getPaginationStats: getPaginationStats,

        // Constants passthrough for convenience
        USABLE_HEIGHT: GLRS_DOC.USABLE_HEIGHT,
        PAGE_HEIGHT: GLRS_DOC.PAGE_HEIGHT,
        PAGE_MARGIN: GLRS_DOC.PAGE_MARGIN,
        HEADER_HEIGHT: GLRS_DOC.HEADER_HEIGHT,
        FOOTER_HEIGHT: GLRS_DOC.FOOTER_HEIGHT
    };

    // Freeze to prevent accidental modification
    Object.freeze(window.GLRS_PAGINATION);

    console.log('[GLRS_PAGINATION] Pagination module loaded:', {
        usableHeight: `${GLRS_DOC.USABLE_HEIGHT}px`,
        functions: Object.keys(window.GLRS_PAGINATION).filter(k => typeof window.GLRS_PAGINATION[k] === 'function').length
    });

})();
