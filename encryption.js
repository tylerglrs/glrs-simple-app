/**
 * GLRS LIGHTHOUSE - CLIENT-SIDE ENCRYPTION SYSTEM
 * Phase 5: End-to-end encryption for sensitive PIR data
 * 
 * Uses Web Crypto API (AES-GCM 256-bit encryption)
 * Zero-knowledge architecture - server never sees plaintext
 * Recovery key system for account restoration
 */

class GLRSEncryption {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12; // 96 bits for GCM
    }

    /**
     * Generate a new encryption key from user password + salt
     * Uses PBKDF2 with 100,000 iterations
     */
    async generateKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: this.algorithm, length: this.keyLength },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt sensitive data
     * Returns: { ciphertext: base64, iv: base64 }
     */
    async encrypt(plaintext, key) {
        if (!plaintext) return null;

        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

        const ciphertext = await crypto.subtle.encrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            encoder.encode(plaintext)
        );

        return {
            ciphertext: this.arrayBufferToBase64(ciphertext),
            iv: this.arrayBufferToBase64(iv)
        };
    }

    /**
     * Decrypt encrypted data
     * Input: { ciphertext: base64, iv: base64 }
     * Returns: plaintext string
     */
    async decrypt(encrypted, key) {
        if (!encrypted || !encrypted.ciphertext || !encrypted.iv) return null;

        try {
            const ciphertext = this.base64ToArrayBuffer(encrypted.ciphertext);
            const iv = this.base64ToArrayBuffer(encrypted.iv);

            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                ciphertext
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    /**
     * Generate recovery key (24-word mnemonic)
     * Used for account recovery if password is lost
     */
    async generateRecoveryKey() {
        const randomBytes = crypto.getRandomValues(new Uint8Array(32));
        const wordlist = await this.getWordlist();
        const words = [];

        for (let i = 0; i < 24; i++) {
            const index = randomBytes[i] % wordlist.length;
            words.push(wordlist[index]);
        }

        return words.join(' ');
    }

    /**
     * Export encryption key as base64 (for secure storage)
     */
    async exportKey(key) {
        const exported = await crypto.subtle.exportKey('raw', key);
        return this.arrayBufferToBase64(exported);
    }

    /**
     * Import encryption key from base64
     */
    async importKey(base64Key) {
        const keyBuffer = this.base64ToArrayBuffer(base64Key);
        return await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: this.algorithm, length: this.keyLength },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Hash data using SHA-256 (for integrity checks)
     */
    async hash(data) {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        return this.arrayBufferToBase64(hashBuffer);
    }

    // Utility functions
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // BIP39-like wordlist (simplified - 256 words)
    async getWordlist() {
        return [
            'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
            'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
            'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
            'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
            'advice', 'aerobic', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
            'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
            'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha',
            'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount',
            'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal',
            'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
            'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch',
            'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army',
            'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist',
            'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume', 'asthma',
            'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction', 'audit',
            'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid',
            'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby',
            'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball', 'bamboo',
            'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base', 'basic',
            'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become', 'beef',
            'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench',
            'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid',
            'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade',
            'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood', 'blossom',
            'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body', 'boil',
            'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow',
            'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand',
            'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief', 'bright',
            'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother', 'brown',
            'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk',
            'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business',
            'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable', 'cactus'
        ];
    }
}

/**
 * Encrypted Field Manager
 * Handles encryption/decryption for specific PIR data fields
 */
class EncryptedFieldManager {
    constructor(encryptionInstance) {
        this.crypto = encryptionInstance;
        
        // Priority 1: Most sensitive fields (always encrypted)
        this.priority1Fields = [
            'emergencyContactName',
            'emergencyContactPhone',
            'emergencyContactRelation',
            'substanceHistory',
            'medicalConditions',
            'medications',
            'therapistName',
            'therapistContact'
        ];

        // Priority 2: Sensitive fields (encrypted by default)
        this.priority2Fields = [
            'address',
            'phoneNumber',
            'dateOfBirth',
            'ssn',
            'insuranceInfo',
            'employmentInfo',
            'familyHistory'
        ];

        // Priority 3: Contextual fields (encrypt based on user preference)
        this.priority3Fields = [
            'journalEntries',
            'progressNotes',
            'goalDetails',
            'checkInNotes',
            'messageContent',
            'communityPosts'
        ];
    }

    /**
     * Encrypt user data object
     * Returns new object with encrypted fields marked
     */
    async encryptUserData(userData, encryptionKey) {
        const encrypted = { ...userData };
        const encryptedFields = [];

        for (const field of [...this.priority1Fields, ...this.priority2Fields]) {
            if (userData[field]) {
                encrypted[field] = await this.crypto.encrypt(userData[field], encryptionKey);
                encryptedFields.push(field);
            }
        }

        encrypted._encryptedFields = encryptedFields;
        encrypted._encryptionVersion = 1;
        encrypted._encryptedAt = new Date().toISOString();

        return encrypted;
    }

    /**
     * Decrypt user data object
     * Returns object with decrypted plaintext fields
     */
    async decryptUserData(encryptedData, encryptionKey) {
        const decrypted = { ...encryptedData };

        if (!encryptedData._encryptedFields) {
            return decrypted; // No encryption applied
        }

        for (const field of encryptedData._encryptedFields) {
            if (encryptedData[field]) {
                decrypted[field] = await this.crypto.decrypt(encryptedData[field], encryptionKey);
            }
        }

        return decrypted;
    }

    /**
     * Check if user has encryption enabled
     */
    isEncrypted(userData) {
        return userData._encryptedFields && userData._encryptedFields.length > 0;
    }
}

// Export for use in portals
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GLRSEncryption, EncryptedFieldManager };
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.GLRSEncryption = GLRSEncryption;
    window.EncryptedFieldManager = EncryptedFieldManager;
}

console.log('✅ GLRS Encryption System Loaded');
