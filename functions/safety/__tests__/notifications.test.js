/**
 * Notification Integration Tests
 * Phase 8F-2: Integration Testing
 *
 * Tests the notification matrix and structure
 */

// Mock Firebase Admin SDK before any requires
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            firstName: 'Test',
            lastName: 'Coach',
            email: 'coach@test.com',
            fcmTokens: ['test-token'],
          }),
        }),
        set: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      })),
      add: jest.fn().mockResolvedValue({ id: 'new-doc-id' }),
      where: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ docs: [] }),
      })),
    })),
  })),
  messaging: jest.fn(() => ({
    send: jest.fn().mockResolvedValue('message-id'),
    sendMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
  })),
}));

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'SM123' }),
    },
  }));
});

// Mock notification helpers
jest.mock('../../notifications/helpers/sendNotification', () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../notifications/email/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../notifications/email/templates/crisisAlert', () => ({
  crisisAlertTemplate: jest.fn().mockReturnValue('<html>Crisis Alert</html>'),
}));

jest.mock('../../notifications/sms/sendSMS', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true, sid: 'SM123' }),
}));

const { NOTIFICATION_MATRIX } = require('../sendCrisisNotifications');

// =============================================================================
// NOTIFICATION MATRIX TESTS
// =============================================================================

describe('Notification Matrix Structure', () => {
  test('should have all four tiers defined', () => {
    expect(NOTIFICATION_MATRIX.critical).toBeDefined();
    expect(NOTIFICATION_MATRIX.high).toBeDefined();
    expect(NOTIFICATION_MATRIX.moderate).toBeDefined();
    expect(NOTIFICATION_MATRIX.standard).toBeDefined();
  });

  test('critical tier should have all channels enabled', () => {
    expect(NOTIFICATION_MATRIX.critical.push).toBe(true);
    expect(NOTIFICATION_MATRIX.critical.email).toBe(true);
    expect(NOTIFICATION_MATRIX.critical.sms).toBe(true);
  });

  test('critical tier should have 2-second max delay', () => {
    expect(NOTIFICATION_MATRIX.critical.timing).toBe('immediate');
    expect(NOTIFICATION_MATRIX.critical.maxDelay).toBe(2000);
  });

  test('high tier should have push and email but not SMS', () => {
    expect(NOTIFICATION_MATRIX.high.push).toBe(true);
    expect(NOTIFICATION_MATRIX.high.email).toBe(true);
    expect(NOTIFICATION_MATRIX.high.sms).toBe(false);
  });

  test('high tier should have 5-minute max delay', () => {
    expect(NOTIFICATION_MATRIX.high.timing).toBe('immediate');
    expect(NOTIFICATION_MATRIX.high.maxDelay).toBe(300000);
  });

  test('moderate tier should be digest-only', () => {
    expect(NOTIFICATION_MATRIX.moderate.push).toBe(false);
    expect(NOTIFICATION_MATRIX.moderate.email).toBe(false);
    expect(NOTIFICATION_MATRIX.moderate.sms).toBe(false);
    expect(NOTIFICATION_MATRIX.moderate.timing).toBe('digest');
  });

  test('standard tier should be log-only', () => {
    expect(NOTIFICATION_MATRIX.standard.push).toBe(false);
    expect(NOTIFICATION_MATRIX.standard.email).toBe(false);
    expect(NOTIFICATION_MATRIX.standard.sms).toBe(false);
    expect(NOTIFICATION_MATRIX.standard.timing).toBe('log-only');
  });
});

// =============================================================================
// NOTIFICATION CHANNEL MAPPING
// =============================================================================

describe('Notification Channel Mapping', () => {
  // Helper to get channels for a tier
  function getChannelsForTier(tier) {
    const channels = [];
    const config = NOTIFICATION_MATRIX[tier];
    if (!config) return [];

    if (config.push) channels.push('push');
    if (config.email) channels.push('email');
    if (config.sms) channels.push('sms');
    return channels;
  }

  test('critical tier should send via 3 channels', () => {
    const channels = getChannelsForTier('critical');
    expect(channels).toEqual(['push', 'email', 'sms']);
    expect(channels.length).toBe(3);
  });

  test('high tier should send via 2 channels', () => {
    const channels = getChannelsForTier('high');
    expect(channels).toEqual(['push', 'email']);
    expect(channels.length).toBe(2);
  });

  test('moderate tier should send via 0 immediate channels', () => {
    const channels = getChannelsForTier('moderate');
    expect(channels).toEqual([]);
    expect(channels.length).toBe(0);
  });

  test('standard tier should send via 0 channels', () => {
    const channels = getChannelsForTier('standard');
    expect(channels).toEqual([]);
    expect(channels.length).toBe(0);
  });
});

// =============================================================================
// TIMING REQUIREMENTS
// =============================================================================

describe('Timing Requirements', () => {
  test('critical alerts must be sent within 2 seconds', () => {
    expect(NOTIFICATION_MATRIX.critical.maxDelay).toBeLessThanOrEqual(2000);
  });

  test('high alerts must be sent within 5 minutes', () => {
    expect(NOTIFICATION_MATRIX.high.maxDelay).toBeLessThanOrEqual(300000);
  });

  test('moderate alerts are batched in daily digest', () => {
    expect(NOTIFICATION_MATRIX.moderate.timing).toBe('digest');
    expect(NOTIFICATION_MATRIX.moderate.maxDelay).toBeNull();
  });

  test('standard alerts are logged only', () => {
    expect(NOTIFICATION_MATRIX.standard.timing).toBe('log-only');
    expect(NOTIFICATION_MATRIX.standard.maxDelay).toBeNull();
  });
});

// =============================================================================
// ESCALATION RULES
// =============================================================================

describe('Escalation Rules', () => {
  test('only critical tier triggers SMS', () => {
    expect(NOTIFICATION_MATRIX.critical.sms).toBe(true);
    expect(NOTIFICATION_MATRIX.high.sms).toBe(false);
    expect(NOTIFICATION_MATRIX.moderate.sms).toBe(false);
    expect(NOTIFICATION_MATRIX.standard.sms).toBe(false);
  });

  test('critical and high tiers trigger immediate push', () => {
    expect(NOTIFICATION_MATRIX.critical.push).toBe(true);
    expect(NOTIFICATION_MATRIX.high.push).toBe(true);
    expect(NOTIFICATION_MATRIX.moderate.push).toBe(false);
    expect(NOTIFICATION_MATRIX.standard.push).toBe(false);
  });

  test('critical and high tiers trigger immediate email', () => {
    expect(NOTIFICATION_MATRIX.critical.email).toBe(true);
    expect(NOTIFICATION_MATRIX.high.email).toBe(true);
    expect(NOTIFICATION_MATRIX.moderate.email).toBe(false);
    expect(NOTIFICATION_MATRIX.standard.email).toBe(false);
  });
});

// =============================================================================
// NOTIFICATION CONTENT STRUCTURE
// =============================================================================

describe('Notification Content Structure', () => {
  test('critical tier should include all required fields', () => {
    const config = NOTIFICATION_MATRIX.critical;
    expect(config).toHaveProperty('push');
    expect(config).toHaveProperty('email');
    expect(config).toHaveProperty('sms');
    expect(config).toHaveProperty('timing');
    expect(config).toHaveProperty('maxDelay');
  });

  test('all tiers should have timing property', () => {
    expect(NOTIFICATION_MATRIX.critical).toHaveProperty('timing');
    expect(NOTIFICATION_MATRIX.high).toHaveProperty('timing');
    expect(NOTIFICATION_MATRIX.moderate).toHaveProperty('timing');
    expect(NOTIFICATION_MATRIX.standard).toHaveProperty('timing');
  });

  test('all tiers should have maxDelay property', () => {
    expect(NOTIFICATION_MATRIX.critical).toHaveProperty('maxDelay');
    expect(NOTIFICATION_MATRIX.high).toHaveProperty('maxDelay');
    expect(NOTIFICATION_MATRIX.moderate).toHaveProperty('maxDelay');
    expect(NOTIFICATION_MATRIX.standard).toHaveProperty('maxDelay');
  });
});

// =============================================================================
// RECIPIENT TARGETING
// =============================================================================

describe('Recipient Targeting', () => {
  test('matrix should support coach notifications', () => {
    // Critical and high should go to assigned coach
    expect(NOTIFICATION_MATRIX.critical.push).toBe(true);
    expect(NOTIFICATION_MATRIX.high.push).toBe(true);
  });

  test('matrix should support SMS for emergency escalation', () => {
    expect(NOTIFICATION_MATRIX.critical.sms).toBe(true);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Edge Cases', () => {
  test('should handle undefined tier gracefully', () => {
    expect(NOTIFICATION_MATRIX['nonexistent']).toBeUndefined();
  });

  test('should handle empty tier name', () => {
    expect(NOTIFICATION_MATRIX['']).toBeUndefined();
  });

  test('all defined tiers should have boolean channel flags', () => {
    Object.values(NOTIFICATION_MATRIX).forEach((config) => {
      expect(typeof config.push).toBe('boolean');
      expect(typeof config.email).toBe('boolean');
      expect(typeof config.sms).toBe('boolean');
    });
  });
});
