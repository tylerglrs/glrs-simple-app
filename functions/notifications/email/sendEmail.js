const admin = require('firebase-admin');

/**
 * Send email using Firebase Trigger Email Extension
 * Writes to Firestore 'mail' collection which triggers automatic email sending
 *
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject line
 * @param {string} params.html - HTML content of email
 * @param {string} params.text - Plain text version (optional, will be auto-generated if not provided)
 * @returns {Promise<void>}
 */
async function sendEmail({
    to,
    subject,
    html,
    text = null
}) {
    // Validate required parameters
    if (!to) {
        throw new Error('Email recipient (to) is required');
    }

    if (!subject) {
        throw new Error('Email subject is required');
    }

    if (!html) {
        throw new Error('Email HTML content is required');
    }

    const db = admin.firestore();

    try {
        // Generate plain text version if not provided
        const plainText = text || htmlToPlainText(html);

        // Write to mail collection - Firebase Email Extension picks this up
        await db.collection('mail').add({
            to: Array.isArray(to) ? to : [to],  // Ensure it's an array
            message: {
                subject: subject,
                html: html,
                text: plainText
            },
            tenantId: 'glrs'
        });

        console.log(`Email queued successfully to ${to}`);

    } catch (error) {
        console.error('Error queueing email:', error);
        throw error;
    }
}

/**
 * Convert HTML to plain text
 * Strips HTML tags and decodes entities for plain text version
 *
 * @param {string} html - HTML content
 * @returns {string} - Plain text version
 */
function htmlToPlainText(html) {
    return html
        // Remove style and script tags and their content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        // Replace line breaks and paragraphs with newlines
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/tr>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        // Remove all other HTML tags
        .replace(/<[^>]+>/g, '')
        // Decode common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&copy;/g, '(c)')
        .replace(/&#10003;/g, '[checkmark]')
        // Clean up whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
}

/**
 * Replace template variables in HTML string
 * Simple template engine for {{variable}} syntax
 *
 * @param {string} template - HTML template string
 * @param {Object} data - Data object with variable values
 * @returns {string} - Rendered HTML
 */
function renderTemplate(template, data) {
    let rendered = template;

    // Replace {{variable}} with data.variable
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = data[key] !== undefined && data[key] !== null ? data[key] : '';
        rendered = rendered.replace(regex, value);
    });

    // Handle {{#if condition}} blocks
    rendered = rendered.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
        return data[condition] ? content : '';
    });

    // Handle {{#each array}} blocks
    rendered = rendered.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, itemTemplate) => {
        const array = data[arrayName];
        if (!Array.isArray(array) || array.length === 0) {
            return '';
        }

        return array.map(item => {
            let itemHtml = itemTemplate;
            // Replace {{this.property}} with item.property
            Object.keys(item).forEach(key => {
                const regex = new RegExp(`{{this\\.${key}}}`, 'g');
                itemHtml = itemHtml.replace(regex, item[key]);
            });
            return itemHtml;
        }).join('');
    });

    return rendered;
}

/**
 * Create unsubscribe link for email preferences
 *
 * @param {string} userId - User ID
 * @param {string} emailType - Type of email (daily, weekly, monthly, progress)
 * @returns {string} - Unsubscribe URL
 */
function getUnsubscribeLink(userId, emailType) {
    return `https://app.glrecoveryservices.com/profile?section=notifications&unsubscribe=${emailType}&userId=${userId}`;
}

module.exports = {
    sendEmail,
    renderTemplate,
    getUnsubscribeLink,
    htmlToPlainText
};
