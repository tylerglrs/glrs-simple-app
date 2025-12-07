/**
 * GLRS Document Template System - Shared Constants
 *
 * SINGLE SOURCE OF TRUTH for all document dimensions and measurements.
 * This file is imported by both templates.html (editor) and sign.html (viewer)
 * to ensure WYSIWYG consistency.
 *
 * DO NOT duplicate these values elsewhere. Always reference window.GLRS_DOC.
 *
 * Industry Standards Applied:
 * - Page: US Letter @ 96 DPI (816 x 1056px)
 * - Header: 70px (~0.73") - professional document standard
 * - Footer: 50px (~0.52") - professional document standard
 * - Drop zones: 24-40px - WCAG accessibility standard
 * - Line length: 75 chars - optimal readability
 *
 * @version 1.0.0
 * @date 2025-11-27
 */

(function() {
    'use strict';

    // Page dimensions (US Letter @ 96 DPI)
    const PAGE_WIDTH = 816;   // 8.5 inches * 96 DPI
    const PAGE_HEIGHT = 1056; // 11 inches * 96 DPI

    // Margins (0.625 inches * 96 DPI)
    const PAGE_MARGIN = 60;

    // Header/Footer heights (INDUSTRY STANDARD)
    const HEADER_HEIGHT = 70;  // ~0.73 inches - professional standard
    const FOOTER_HEIGHT = 50;  // ~0.52 inches - professional standard

    // Safety margin for pagination (prevents overflow)
    const SAFETY_MARGIN = 0.95;

    // Calculate content area
    // Raw: PAGE_HEIGHT - (margins * 2) - header - footer
    // 1056 - 120 - 70 - 50 = 816px
    const CONTENT_HEIGHT = PAGE_HEIGHT - (PAGE_MARGIN * 2) - HEADER_HEIGHT - FOOTER_HEIGHT;

    // Usable height with safety margin
    // 816 * 0.9 = 734.4 -> 734px
    const USABLE_HEIGHT = Math.floor(CONTENT_HEIGHT * SAFETY_MARGIN);

    // Block height definitions (in pixels)
    const BLOCKS = {
        section: 70,
        heading: 40,
        signatureField: 65,
        signatureBlock: 65,
        initialsField: 55,
        dateField: 50,
        textField: 50,
        textInputField: 50,
        checkboxField: 40,
        acknowledgment: 40,
        dropdownField: 50,
        divider: 16,
        pageBreak: 0,  // Special handling - forces new page
    };

    // Typography settings
    const TYPOGRAPHY = {
        charsPerLine: 100,     // Accurate for 696px width @ 14px font
        lineHeight: 16,        // Pixels per line (tighter estimate)
        paragraphBase: 24,     // Minimum paragraph height
        baseFontSize: 14,      // Base font size in pixels
    };

    // Drop zone dimensions (WCAG accessibility standard)
    const DROP_ZONE = {
        resting: 24,   // Minimum touch target
        active: 40,    // Expanded when dragging
        transition: '150ms ease',
    };

    // Helper function: Calculate paragraph height based on content
    function getParagraphHeight(content) {
        const text = content || '';
        const lines = Math.ceil(text.length / TYPOGRAPHY.charsPerLine);
        return Math.max(TYPOGRAPHY.paragraphBase, lines * TYPOGRAPHY.lineHeight + 12);
    }

    // Helper function: Calculate bullet list height based on item count
    function getBulletListHeight(items) {
        const itemCount = (items || []).length;
        const itemHeight = 28;
        const baseHeight = 24;
        return baseHeight + (itemCount * itemHeight);
    }

    // Helper function: Get height for any block type
    function getBlockHeight(block) {
        switch (block.type) {
            case 'paragraph':
                return getParagraphHeight(block.content);
            case 'bulletList':
                return getBulletListHeight(block.items);
            default:
                return BLOCKS[block.type] || 60;
        }
    }

    // Helper function: Calculate usable content height based on header/footer presence
    function getUsableContentHeight(hasHeader = true, hasFooter = true) {
        const headerAdjust = hasHeader ? HEADER_HEIGHT : 0;
        const footerAdjust = hasFooter ? FOOTER_HEIGHT : 0;
        const baseHeight = PAGE_HEIGHT - (PAGE_MARGIN * 2) - headerAdjust - footerAdjust;
        return Math.floor(baseHeight * SAFETY_MARGIN);
    }

    // Pagination function: Distribute blocks across pages
    function paginateBlocks(blocks, usableHeight = USABLE_HEIGHT) {
        const pages = [[]];
        let currentPageHeight = 0;
        let currentPageIndex = 0;

        console.log('[PAGINATION] Starting with usableHeight:', usableHeight);

        blocks.forEach((block, i) => {
            // Page break forces new page
            if (block.type === 'pageBreak') {
                currentPageIndex++;
                pages.push([]);
                currentPageHeight = 0;
                return; // Don't add pageBreak block to page content
            }

            const blockHeight = getBlockHeight(block);
            const wouldOverflow = currentPageHeight + blockHeight > usableHeight;

            console.log(`[PAGINATION] Block ${i} (${block.type}): height=${blockHeight}px, pageHeight=${currentPageHeight}px, remaining=${usableHeight - currentPageHeight}px, wouldOverflow=${wouldOverflow}`);

            // If this block would overflow, start new page
            // UNLESS it's the first block on the page (avoid infinite loop for oversized blocks)
            if (wouldOverflow && pages[currentPageIndex].length > 0) {
                console.log(`[PAGINATION] >>> NEW PAGE - Block ${i} pushed to page ${currentPageIndex + 1}`);
                currentPageIndex++;
                pages.push([]);
                currentPageHeight = 0;
            }

            // Add block to current page
            pages[currentPageIndex].push(block);
            currentPageHeight += blockHeight;
        });

        console.log('[PAGINATION] Final pages:', pages.map((p, i) => `Page ${i+1}: ${p.length} blocks`));
        return pages;
    }

    // Export to global namespace
    window.GLRS_DOC = {
        // Page dimensions
        PAGE_WIDTH: PAGE_WIDTH,
        PAGE_HEIGHT: PAGE_HEIGHT,
        PAGE_MARGIN: PAGE_MARGIN,

        // Header/Footer
        HEADER_HEIGHT: HEADER_HEIGHT,
        FOOTER_HEIGHT: FOOTER_HEIGHT,

        // Content area calculations
        CONTENT_HEIGHT: CONTENT_HEIGHT,
        SAFETY_MARGIN: SAFETY_MARGIN,
        USABLE_HEIGHT: USABLE_HEIGHT,

        // Block heights
        BLOCKS: BLOCKS,

        // Typography
        TYPOGRAPHY: TYPOGRAPHY,

        // Drop zones
        DROP_ZONE: DROP_ZONE,

        // Helper functions
        getParagraphHeight: getParagraphHeight,
        getBulletListHeight: getBulletListHeight,
        getBlockHeight: getBlockHeight,
        getUsableContentHeight: getUsableContentHeight,
        paginateBlocks: paginateBlocks,
    };

    // Freeze to prevent accidental modification
    Object.freeze(window.GLRS_DOC);
    Object.freeze(window.GLRS_DOC.BLOCKS);
    Object.freeze(window.GLRS_DOC.TYPOGRAPHY);
    Object.freeze(window.GLRS_DOC.DROP_ZONE);

    console.log('[GLRS_DOC] Document constants loaded:', {
        pageSize: `${PAGE_WIDTH}x${PAGE_HEIGHT}px`,
        header: `${HEADER_HEIGHT}px`,
        footer: `${FOOTER_HEIGHT}px`,
        usableHeight: `${USABLE_HEIGHT}px`,
    });

})();
