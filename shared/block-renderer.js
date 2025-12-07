/**
 * GLRS Document Template System - Shared Block Renderer
 *
 * SINGLE SOURCE OF TRUTH for all block rendering logic.
 * This file is imported by both templates.html (editor) and sign.html (viewer)
 * to ensure WYSIWYG consistency.
 *
 * Dependencies:
 * - /shared/document-constants.js (GLRS_DOC)
 * - /shared/block-styles.js (GLRS_STYLES)
 * - React (loaded via CDN in both files)
 *
 * Architecture:
 * - GLRS_RENDERER: Returns render definitions (plain objects)
 * - GLRS_REACT: Converts definitions to React elements
 *
 * @version 1.0.0
 * @date 2025-11-27
 */

(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (!window.GLRS_STYLES) {
        console.error('[GLRS_RENDERER] GLRS_STYLES not loaded. Load block-styles.js first.');
        return;
    }

    // ==========================================
    // RENDER DEFINITIONS (Plain Objects)
    // ==========================================

    /**
     * Render section block
     * @param {Object} block - Block data
     * @param {number} index - Block index in document
     */
    function renderSection(block, index) {
        const styles = GLRS_STYLES.getSectionStyle({ index });

        const children = [];

        // Number badge (optional)
        if (block.number) {
            children.push({
                type: 'span',
                style: styles.numberBadge,
                content: block.number
            });
        }

        // Section title
        children.push({
            type: 'text',
            content: block.title || 'Section Title'
        });

        return {
            type: 'div',
            style: styles.container,
            children: children
        };
    }

    /**
     * Render heading block
     * @param {Object} block - Block data
     */
    function renderHeading(block) {
        const level = block.level || 1;
        const style = GLRS_STYLES.getHeadingStyle(level);

        return {
            type: 'div',
            style: style,
            content: block.content || 'Heading'
        };
    }

    /**
     * Render paragraph block
     * @param {Object} block - Block data
     */
    function renderParagraph(block) {
        return {
            type: 'p',
            style: GLRS_STYLES.PARAGRAPH_STYLE,
            content: block.content || ''
        };
    }

    /**
     * Render bullet list block
     * @param {Object} block - Block data
     */
    function renderBulletList(block) {
        const items = (block.items || []).map((item, i) => ({
            type: 'li',
            style: GLRS_STYLES.BULLET_LIST_STYLES.item,
            content: item,
            key: i
        }));

        return {
            type: 'ul',
            style: GLRS_STYLES.BULLET_LIST_STYLES.container,
            children: items
        };
    }

    /**
     * Render divider block
     */
    function renderDivider() {
        return {
            type: 'div',
            style: GLRS_STYLES.DIVIDER_STYLE
        };
    }

    /**
     * Render page break (editor visual indicator)
     */
    function renderPageBreak() {
        return {
            type: 'div',
            style: GLRS_STYLES.PAGE_BREAK_STYLE.container,
            className: 'page-break-indicator',
            children: [
                { type: 'div', style: GLRS_STYLES.PAGE_BREAK_STYLE.line },
                { type: 'span', style: GLRS_STYLES.PAGE_BREAK_STYLE.label, content: 'Page Break' },
                { type: 'div', style: GLRS_STYLES.PAGE_BREAK_STYLE.line }
            ]
        };
    }

    /**
     * Render signature field
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, onClick, roleData }
     */
    function renderSignatureField(block, options = {}) {
        const { isEditable = false, value, roleData = {} } = options;
        const borderColor = roleData.borderColor || GLRS_STYLES.COLORS.gray300;
        const bgLight = roleData.bgLight || GLRS_STYLES.COLORS.gray50;

        const wrapperStyle = GLRS_STYLES.getFieldWrapperStyle({
            borderColor: borderColor,
            bgLight: bgLight,
            isEditable: isEditable
        });

        const boxStyle = GLRS_STYLES.getSignatureBoxStyle({
            type: 'signatureField',
            isCompleted: !!value,
            borderColor: borderColor
        });

        const children = [
            // Label
            {
                type: 'div',
                style: GLRS_STYLES.FIELD_LABEL_STYLE,
                children: [
                    { type: 'text', content: block.label || 'Signature' },
                    block.required ? { type: 'span', style: GLRS_STYLES.REQUIRED_STYLE, content: '*' } : null
                ].filter(Boolean)
            },
            // Signature box
            {
                type: 'div',
                style: boxStyle,
                children: value ? [
                    { type: 'img', src: value, alt: 'Signature', style: { maxHeight: '45px' } }
                ] : [
                    {
                        type: 'span',
                        style: GLRS_STYLES.PLACEHOLDER_STYLE,
                        content: isEditable ? 'Click to sign' : `Awaiting ${roleData.label || 'signature'}`
                    }
                ]
            }
        ];

        // Role badge for non-editable fields
        if (!isEditable && roleData.label) {
            children.push({
                type: 'div',
                style: GLRS_STYLES.getRoleBadgeStyle({ bgLight: bgLight, color: roleData.color }),
                content: roleData.label
            });
        }

        return {
            type: 'div',
            style: wrapperStyle,
            children: children,
            interactive: true,
            fieldType: 'signatureField'
        };
    }

    /**
     * Render initials field
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, onClick, roleData }
     */
    function renderInitialsField(block, options = {}) {
        const { isEditable = false, value, roleData = {} } = options;
        const borderColor = roleData.borderColor || GLRS_STYLES.COLORS.gray300;
        const bgLight = roleData.bgLight || GLRS_STYLES.COLORS.gray50;

        const wrapperStyle = GLRS_STYLES.getFieldWrapperStyle({
            borderColor: borderColor,
            bgLight: bgLight,
            isEditable: isEditable
        });

        const boxStyle = GLRS_STYLES.getSignatureBoxStyle({
            type: 'initialsField',
            isCompleted: !!value,
            borderColor: borderColor
        });

        const children = [
            // Label
            {
                type: 'div',
                style: GLRS_STYLES.FIELD_LABEL_STYLE,
                children: [
                    { type: 'text', content: block.label || 'Initials' },
                    block.required ? { type: 'span', style: GLRS_STYLES.REQUIRED_STYLE, content: '*' } : null
                ].filter(Boolean)
            },
            // Initials box
            {
                type: 'div',
                style: boxStyle,
                children: value ? [
                    { type: 'img', src: value, alt: 'Initials', style: { maxHeight: '40px' } }
                ] : [
                    {
                        type: 'span',
                        style: GLRS_STYLES.PLACEHOLDER_STYLE,
                        content: isEditable ? 'Click to sign' : `Awaiting ${roleData.label || 'initials'}`
                    }
                ]
            }
        ];

        // Role badge for non-editable fields
        if (!isEditable && roleData.label) {
            children.push({
                type: 'div',
                style: GLRS_STYLES.getRoleBadgeStyle({ bgLight: bgLight, color: roleData.color }),
                content: roleData.label
            });
        }

        return {
            type: 'div',
            style: wrapperStyle,
            children: children,
            interactive: true,
            fieldType: 'initialsField'
        };
    }

    /**
     * Render date field
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, roleData }
     */
    function renderDateField(block, options = {}) {
        const { isEditable = false, value, roleData = {} } = options;
        const borderColor = roleData.borderColor || GLRS_STYLES.COLORS.gray300;
        const bgLight = roleData.bgLight || GLRS_STYLES.COLORS.gray50;

        const wrapperStyle = GLRS_STYLES.getFieldWrapperStyle({
            borderColor: borderColor,
            bgLight: bgLight,
            isEditable: isEditable
        });

        const inputStyle = GLRS_STYLES.getInputStyle({ isEditable: isEditable });

        // Determine display value
        let displayValue = value || '';
        if (!displayValue && block.autoFill) {
            displayValue = new Date().toISOString().split('T')[0];
        }

        const children = [
            // Label
            {
                type: 'div',
                style: GLRS_STYLES.FIELD_LABEL_STYLE,
                children: [
                    { type: 'text', content: block.label || 'Date' },
                    block.required ? { type: 'span', style: GLRS_STYLES.REQUIRED_STYLE, content: '*' } : null
                ].filter(Boolean)
            },
            // Input
            {
                type: 'input',
                inputType: 'date',
                style: inputStyle,
                value: displayValue,
                disabled: !isEditable
            }
        ];

        // Role badge for non-editable fields
        if (!isEditable && roleData.label) {
            children.push({
                type: 'div',
                style: GLRS_STYLES.getRoleBadgeStyle({ bgLight: bgLight, color: roleData.color }),
                content: roleData.label
            });
        }

        return {
            type: 'div',
            style: wrapperStyle,
            children: children,
            interactive: true,
            fieldType: 'dateField'
        };
    }

    /**
     * Render text input field
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, roleData }
     */
    function renderTextInputField(block, options = {}) {
        const { isEditable = false, value, roleData = {} } = options;
        const borderColor = roleData.borderColor || GLRS_STYLES.COLORS.gray300;
        const bgLight = roleData.bgLight || GLRS_STYLES.COLORS.gray50;

        const wrapperStyle = GLRS_STYLES.getFieldWrapperStyle({
            borderColor: borderColor,
            bgLight: bgLight,
            isEditable: isEditable
        });

        const inputStyle = GLRS_STYLES.getInputStyle({ isEditable: isEditable });

        const children = [
            // Label
            {
                type: 'div',
                style: GLRS_STYLES.FIELD_LABEL_STYLE,
                children: [
                    { type: 'text', content: block.label || 'Text Input' },
                    block.required ? { type: 'span', style: GLRS_STYLES.REQUIRED_STYLE, content: '*' } : null
                ].filter(Boolean)
            },
            // Input
            {
                type: 'input',
                inputType: 'text',
                style: inputStyle,
                value: value || '',
                placeholder: block.placeholder || '',
                maxLength: block.maxLength || 100,
                disabled: !isEditable
            }
        ];

        // Role badge for non-editable fields
        if (!isEditable && roleData.label) {
            children.push({
                type: 'div',
                style: GLRS_STYLES.getRoleBadgeStyle({ bgLight: bgLight, color: roleData.color }),
                content: roleData.label
            });
        }

        return {
            type: 'div',
            style: wrapperStyle,
            children: children,
            interactive: true,
            fieldType: 'textInputField'
        };
    }

    /**
     * Render checkbox field
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, roleData }
     */
    function renderCheckboxField(block, options = {}) {
        const { isEditable = false, value, roleData = {} } = options;
        const borderColor = roleData.borderColor || GLRS_STYLES.COLORS.gray300;
        const bgLight = roleData.bgLight || GLRS_STYLES.COLORS.gray50;

        const wrapperStyle = {
            ...GLRS_STYLES.getFieldWrapperStyle({
                borderColor: borderColor,
                bgLight: bgLight,
                isEditable: isEditable
            }),
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
        };

        const checkboxStyles = GLRS_STYLES.getCheckboxStyle({
            isChecked: !!value,
            borderColor: borderColor
        });

        const children = [
            // Checkbox box
            {
                type: 'div',
                style: checkboxStyles.box,
                children: value ? [{ type: 'checkIcon', size: 14, color: 'white' }] : []
            },
            // Label container
            {
                type: 'div',
                style: { flex: 1 },
                children: [
                    { type: 'span', style: checkboxStyles.label, content: block.label || 'Checkbox' },
                    block.required ? { type: 'span', style: GLRS_STYLES.REQUIRED_STYLE, content: ' *' } : null
                ].filter(Boolean)
            }
        ];

        // Role badge for non-editable fields
        if (!isEditable && roleData.label) {
            children.push({
                type: 'div',
                style: GLRS_STYLES.getRoleBadgeStyle({ bgLight: bgLight, color: roleData.color }),
                content: roleData.label
            });
        }

        return {
            type: 'div',
            style: wrapperStyle,
            children: children,
            interactive: true,
            fieldType: 'checkboxField'
        };
    }

    /**
     * Render dropdown field
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, roleData }
     */
    function renderDropdownField(block, options = {}) {
        const { isEditable = false, value, roleData = {} } = options;
        const borderColor = roleData.borderColor || GLRS_STYLES.COLORS.gray300;
        const bgLight = roleData.bgLight || GLRS_STYLES.COLORS.gray50;

        const wrapperStyle = GLRS_STYLES.getFieldWrapperStyle({
            borderColor: borderColor,
            bgLight: bgLight,
            isEditable: isEditable
        });

        const selectStyle = GLRS_STYLES.getInputStyle({ isEditable: isEditable });

        const selectOptions = [
            { value: '', label: 'Select an option' },
            ...(block.options || []).map(opt => ({ value: opt, label: opt }))
        ];

        const children = [
            // Label
            {
                type: 'div',
                style: GLRS_STYLES.FIELD_LABEL_STYLE,
                children: [
                    { type: 'text', content: block.label || 'Dropdown' },
                    block.required ? { type: 'span', style: GLRS_STYLES.REQUIRED_STYLE, content: '*' } : null
                ].filter(Boolean)
            },
            // Select
            {
                type: 'select',
                style: selectStyle,
                value: value || '',
                disabled: !isEditable,
                options: selectOptions
            }
        ];

        // Role badge for non-editable fields
        if (!isEditable && roleData.label) {
            children.push({
                type: 'div',
                style: GLRS_STYLES.getRoleBadgeStyle({ bgLight: bgLight, color: roleData.color }),
                content: roleData.label
            });
        }

        return {
            type: 'div',
            style: wrapperStyle,
            children: children,
            interactive: true,
            fieldType: 'dropdownField'
        };
    }

    /**
     * Render acknowledgment (checkbox with longer text)
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, roleData }
     */
    function renderAcknowledgment(block, options = {}) {
        // Acknowledgment uses same structure as checkbox
        const result = renderCheckboxField({
            ...block,
            label: block.text || block.label || 'I acknowledge'
        }, options);

        result.fieldType = 'acknowledgment';
        return result;
    }

    /**
     * Render signature block (full signature with name and date lines)
     * @param {Object} block - Block data
     * @param {Object} options - { isEditable, value, onChange, onClick, roleData }
     */
    function renderSignatureBlock(block, options = {}) {
        const { roleData = {} } = options;
        const borderColor = roleData.borderColor || GLRS_STYLES.COLORS.gray300;
        const bgLight = roleData.bgLight || GLRS_STYLES.COLORS.gray100;

        return {
            type: 'div',
            style: {
                padding: '16px',
                border: `2px solid ${borderColor}`,
                borderRadius: '8px',
                background: bgLight
            },
            children: [
                // Header with icon and label
                {
                    type: 'div',
                    style: {
                        fontSize: '11px',
                        color: roleData.color || GLRS_STYLES.COLORS.gray500,
                        fontWeight: '600',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    },
                    children: [
                        { type: 'penIcon', size: 14 },
                        { type: 'text', content: block.label || 'Signature' },
                        block.required ? { type: 'span', style: { color: '#DC2626' }, content: '*' } : null
                    ].filter(Boolean)
                },
                // Signature line
                {
                    type: 'div',
                    style: {
                        borderBottom: `2px solid ${borderColor}`,
                        height: '40px',
                        marginBottom: '8px'
                    }
                },
                // Name and Date grid
                {
                    type: 'div',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px'
                    },
                    children: [
                        {
                            type: 'div',
                            children: [
                                { type: 'div', style: { fontSize: '11px', color: GLRS_STYLES.COLORS.gray400, marginBottom: '4px' }, content: 'Printed Name' },
                                { type: 'div', style: { borderBottom: `1px solid ${GLRS_STYLES.COLORS.gray300}`, height: '24px' } }
                            ]
                        },
                        {
                            type: 'div',
                            children: [
                                { type: 'div', style: { fontSize: '11px', color: GLRS_STYLES.COLORS.gray400, marginBottom: '4px' }, content: 'Date' },
                                { type: 'div', style: { borderBottom: `1px solid ${GLRS_STYLES.COLORS.gray300}`, height: '24px' } }
                            ]
                        }
                    ]
                }
            ],
            interactive: true,
            fieldType: 'signatureBlock'
        };
    }

    /**
     * Main dispatcher - render any block type
     * @param {Object} block - Block data
     * @param {number} index - Block index
     * @param {Object} options - Render options
     */
    function renderBlock(block, index, options = {}) {
        switch (block.type) {
            case 'section':
                return renderSection(block, index);
            case 'heading':
                return renderHeading(block);
            case 'paragraph':
                return renderParagraph(block);
            case 'bulletList':
                return renderBulletList(block);
            case 'divider':
                return renderDivider();
            case 'pageBreak':
                return renderPageBreak();
            case 'signatureField':
                return renderSignatureField(block, options);
            case 'initialsField':
                return renderInitialsField(block, options);
            case 'dateField':
                return renderDateField(block, options);
            case 'textInputField':
            case 'textField':
                return renderTextInputField(block, options);
            case 'checkboxField':
                return renderCheckboxField(block, options);
            case 'dropdownField':
                return renderDropdownField(block, options);
            case 'acknowledgment':
                return renderAcknowledgment(block, options);
            case 'signatureBlock':
                return renderSignatureBlock(block, options);
            default:
                console.warn('[GLRS_RENDERER] Unknown block type:', block.type);
                return null;
        }
    }

    // ==========================================
    // EXPORT RENDERER
    // ==========================================

    window.GLRS_RENDERER = {
        // Individual renderers
        renderSection: renderSection,
        renderHeading: renderHeading,
        renderParagraph: renderParagraph,
        renderBulletList: renderBulletList,
        renderDivider: renderDivider,
        renderPageBreak: renderPageBreak,
        renderSignatureField: renderSignatureField,
        renderInitialsField: renderInitialsField,
        renderDateField: renderDateField,
        renderTextInputField: renderTextInputField,
        renderCheckboxField: renderCheckboxField,
        renderDropdownField: renderDropdownField,
        renderAcknowledgment: renderAcknowledgment,
        renderSignatureBlock: renderSignatureBlock,

        // Main dispatcher
        renderBlock: renderBlock
    };

    Object.freeze(window.GLRS_RENDERER);

    // ==========================================
    // REACT ADAPTER
    // ==========================================

    /**
     * Convert render definition to React element
     * @param {Object} def - Render definition
     * @param {string|number} key - React key
     * @param {Object} handlers - Event handlers { onChange, onClick }
     * @param {Object} Icons - Icon components (lucide-react)
     */
    function createElement(def, key, handlers = {}, Icons = {}) {
        if (!def) return null;

        // Handle text nodes
        if (def.type === 'text') {
            return def.content;
        }

        // Handle icon types
        if (def.type === 'checkIcon' && Icons.Check) {
            return React.createElement(Icons.Check, {
                key: key,
                size: def.size || 14,
                color: def.color || 'currentColor'
            });
        }

        if (def.type === 'penIcon' && Icons.PenLine) {
            return React.createElement(Icons.PenLine, {
                key: key,
                size: def.size || 14
            });
        }

        // Build props
        const props = {
            key: key,
            style: def.style
        };

        if (def.className) {
            props.className = def.className;
        }

        if (def.id) {
            props.id = def.id;
        }

        // Handle input elements
        if (def.type === 'input') {
            props.type = def.inputType || 'text';
            props.value = def.value || '';
            props.disabled = def.disabled;
            props.placeholder = def.placeholder;
            props.maxLength = def.maxLength;
            if (handlers.onChange && !def.disabled) {
                props.onChange = handlers.onChange;
            }
            return React.createElement('input', props);
        }

        // Handle select elements
        if (def.type === 'select') {
            props.value = def.value || '';
            props.disabled = def.disabled;
            if (handlers.onChange && !def.disabled) {
                props.onChange = handlers.onChange;
            }

            const optionElements = (def.options || []).map((opt, i) =>
                React.createElement('option', { key: i, value: opt.value }, opt.label)
            );

            return React.createElement('select', props, optionElements);
        }

        // Handle img elements
        if (def.type === 'img') {
            props.src = def.src;
            props.alt = def.alt || '';
            return React.createElement('img', props);
        }

        // Build children
        let children = null;

        if (def.content !== undefined && def.content !== null) {
            children = def.content;
        } else if (def.children && def.children.length > 0) {
            children = def.children.map((child, i) =>
                createElement(child, child.key !== undefined ? child.key : i, handlers, Icons)
            );
        }

        return React.createElement(def.type, props, children);
    }

    /**
     * Render a block as React element
     * @param {Object} block - Block data
     * @param {number} index - Block index
     * @param {Object} options - { isEditable, value, roleData, handlers, Icons }
     */
    function renderBlockAsReact(block, index, options = {}) {
        const { handlers = {}, Icons = {} } = options;

        const def = renderBlock(block, index, options);
        if (!def) return null;

        return createElement(def, block.id, handlers, Icons);
    }

    /**
     * Check if block type is an interactive field
     * @param {string} type - Block type
     */
    function isFieldType(type) {
        return [
            'signatureField', 'initialsField', 'dateField',
            'textInputField', 'textField', 'checkboxField',
            'dropdownField', 'signatureBlock', 'acknowledgment'
        ].includes(type);
    }

    /**
     * Check if block type is a content block (non-interactive)
     * @param {string} type - Block type
     */
    function isContentType(type) {
        return [
            'section', 'heading', 'paragraph',
            'bulletList', 'divider', 'pageBreak'
        ].includes(type);
    }

    // ==========================================
    // EXPORT REACT ADAPTER
    // ==========================================

    window.GLRS_REACT = {
        createElement: createElement,
        renderBlock: renderBlockAsReact,
        isFieldType: isFieldType,
        isContentType: isContentType
    };

    Object.freeze(window.GLRS_REACT);

    console.log('[GLRS_RENDERER] Block renderer loaded:', {
        contentTypes: ['section', 'heading', 'paragraph', 'bulletList', 'divider', 'pageBreak'],
        fieldTypes: ['signatureField', 'initialsField', 'dateField', 'textInputField', 'checkboxField', 'dropdownField', 'acknowledgment', 'signatureBlock']
    });

})();
