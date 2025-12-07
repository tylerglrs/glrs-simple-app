/**
 * Load/Performance Tests
 * Phase 8F-5: Performance Testing
 *
 * Tests the safety system under load:
 * - Throughput (messages per second)
 * - Latency (response time)
 * - Memory usage
 * - Concurrent request handling
 * - Peak load simulation
 */

// Mock Firebase Admin SDK before any requires
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
        set: jest.fn(),
        update: jest.fn(),
      })),
      add: jest.fn().mockResolvedValue({ id: 'test-id' }),
    })),
    FieldValue: {
      serverTimestamp: jest.fn(),
    },
  })),
}));

// Mock notification helpers
jest.mock('../../notifications/helpers/sendNotification', () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../notifications/email/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../notifications/email/templates/crisisAlert', () => ({
  crisisAlertTemplate: jest.fn().mockReturnValue('<html>Test</html>'),
}));

jest.mock('../../notifications/sms/sendSMS', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true }),
}));

const { scanForCrisis } = require('../detectCrisis');
const {
  TIER_1_CRITICAL,
  TIER_2_HIGH,
  TIER_3_MODERATE,
  TIER_4_STANDARD,
} = require('../crisisKeywords');

// Helper to get all keywords
function getAllKeywords() {
  return [
    ...Object.values(TIER_1_CRITICAL).flat(),
    ...Object.values(TIER_2_HIGH).flat(),
    ...Object.values(TIER_3_MODERATE).flat(),
    ...Object.values(TIER_4_STANDARD).flat(),
  ];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const PERFORMANCE_THRESHOLDS = {
  // Single message processing
  maxSingleMessageLatency: 10, // ms
  maxShortMessageLatency: 5, // ms
  maxLongMessageLatency: 50, // ms

  // Throughput
  minThroughputPerSecond: 100, // messages/second
  minSustainedThroughput: 50, // messages/second for 10 seconds

  // Memory
  maxMemoryIncreaseMB: 50, // MB over baseline

  // Concurrent
  maxConcurrentLatency: 100, // ms for 100 concurrent
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateRandomMessage(length = 100) {
  const words = [
    'today', 'feeling', 'good', 'meeting', 'sponsor', 'grateful',
    'recovery', 'progress', 'family', 'work', 'stress', 'happy',
    'challenge', 'support', 'group', 'therapy', 'medication', 'sleep',
    'exercise', 'food', 'healthy', 'sober', 'clean', 'step', 'program',
  ];

  const message = [];
  while (message.join(' ').length < length) {
    message.push(words[Math.floor(Math.random() * words.length)]);
  }
  return message.join(' ');
}

function generateCrisisMessage(tier = 1) {
  const messages = {
    1: [
      'I want to kill myself right now',
      "I'm going to end it all tonight",
      'I overdosed and need help',
      "I'm cutting myself",
    ],
    2: [
      'I wish I was dead',
      "I'm thinking about using again",
      "Everyone would be better off without me",
    ],
    3: [
      'I feel completely hopeless',
      "I'm having strong cravings",
      'Everything feels pointless',
    ],
    4: [
      "I'm having a hard time today",
      'Feeling stressed about work',
    ],
  };

  const tierMessages = messages[tier] || messages[1];
  return tierMessages[Math.floor(Math.random() * tierMessages.length)];
}

function measureMemory() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed / 1024 / 1024; // MB
  }
  return 0;
}

// =============================================================================
// SINGLE MESSAGE LATENCY TESTS
// =============================================================================

describe('Single Message Latency', () => {
  test(`short message should process in < ${PERFORMANCE_THRESHOLDS.maxShortMessageLatency}ms`, () => {
    const message = 'I feel good today';
    const iterations = 100;

    // Warm up
    for (let i = 0; i < 10; i++) {
      scanForCrisis(message);
    }

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      scanForCrisis(message);
    }
    const elapsed = Date.now() - start;
    const avgLatency = elapsed / iterations;

    console.log(`Short message latency: ${avgLatency.toFixed(2)}ms average`);
    expect(avgLatency).toBeLessThan(PERFORMANCE_THRESHOLDS.maxShortMessageLatency);
  });

  test(`medium message (500 chars) should process in < ${PERFORMANCE_THRESHOLDS.maxSingleMessageLatency}ms`, () => {
    const message = generateRandomMessage(500);
    const iterations = 100;

    // Warm up
    for (let i = 0; i < 10; i++) {
      scanForCrisis(message);
    }

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      scanForCrisis(message);
    }
    const elapsed = Date.now() - start;
    const avgLatency = elapsed / iterations;

    console.log(`Medium message latency: ${avgLatency.toFixed(2)}ms average`);
    expect(avgLatency).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSingleMessageLatency);
  });

  test(`long message (5000 chars) should process in < ${PERFORMANCE_THRESHOLDS.maxLongMessageLatency}ms`, () => {
    const message = generateRandomMessage(5000);
    const iterations = 50;

    // Warm up
    for (let i = 0; i < 5; i++) {
      scanForCrisis(message);
    }

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      scanForCrisis(message);
    }
    const elapsed = Date.now() - start;
    const avgLatency = elapsed / iterations;

    console.log(`Long message latency: ${avgLatency.toFixed(2)}ms average`);
    expect(avgLatency).toBeLessThan(PERFORMANCE_THRESHOLDS.maxLongMessageLatency);
  });

  test('crisis message should have similar latency to safe message', () => {
    const safeMessage = 'Had a great day today, feeling positive';
    const crisisMessage = 'I want to kill myself right now';
    const iterations = 100;

    // Warm up
    scanForCrisis(safeMessage);
    scanForCrisis(crisisMessage);

    // Measure safe
    const safeStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      scanForCrisis(safeMessage);
    }
    const safeTime = Date.now() - safeStart;

    // Measure crisis
    const crisisStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      scanForCrisis(crisisMessage);
    }
    const crisisTime = Date.now() - crisisStart;

    const ratio = Math.max(safeTime, crisisTime) / Math.min(safeTime, crisisTime);
    console.log(`Safe vs Crisis latency ratio: ${ratio.toFixed(2)}x`);

    // Should be within 3x of each other
    expect(ratio).toBeLessThan(3);
  });
});

// =============================================================================
// THROUGHPUT TESTS
// =============================================================================

describe('Throughput', () => {
  test(`should process > ${PERFORMANCE_THRESHOLDS.minThroughputPerSecond} messages/second (mixed content)`, () => {
    const messages = [];
    for (let i = 0; i < 1000; i++) {
      if (i % 10 === 0) {
        messages.push(generateCrisisMessage(Math.ceil(Math.random() * 4)));
      } else {
        messages.push(generateRandomMessage(100));
      }
    }

    // Warm up
    messages.slice(0, 10).forEach((m) => scanForCrisis(m));

    const start = Date.now();
    messages.forEach((m) => scanForCrisis(m));
    const elapsed = Date.now() - start;

    const throughput = (messages.length / elapsed) * 1000;
    console.log(`Throughput: ${throughput.toFixed(0)} messages/second`);

    expect(throughput).toBeGreaterThan(PERFORMANCE_THRESHOLDS.minThroughputPerSecond);
  });

  test('should maintain throughput over sustained period', () => {
    const durationMs = 5000; // 5 seconds
    let messageCount = 0;
    const message = generateRandomMessage(200);

    // Warm up
    for (let i = 0; i < 100; i++) {
      scanForCrisis(message);
    }

    const start = Date.now();
    while (Date.now() - start < durationMs) {
      scanForCrisis(message);
      messageCount++;
    }
    const elapsed = Date.now() - start;

    const throughput = (messageCount / elapsed) * 1000;
    console.log(`Sustained throughput over ${elapsed}ms: ${throughput.toFixed(0)} messages/second`);

    expect(throughput).toBeGreaterThan(PERFORMANCE_THRESHOLDS.minSustainedThroughput);
  });
});

// =============================================================================
// MEMORY TESTS
// =============================================================================

describe('Memory Usage', () => {
  test('should not leak memory over many iterations', () => {
    // Force GC if available
    if (global.gc) {
      global.gc();
    }

    const baselineMemory = measureMemory();
    const iterations = 10000;
    const message = generateRandomMessage(200);

    for (let i = 0; i < iterations; i++) {
      scanForCrisis(message);
    }

    // Force GC if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = measureMemory();
    const memoryIncrease = finalMemory - baselineMemory;

    console.log(`Memory: baseline=${baselineMemory.toFixed(2)}MB, final=${finalMemory.toFixed(2)}MB, increase=${memoryIncrease.toFixed(2)}MB`);

    expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryIncreaseMB);
  });

  test('should handle large messages without excessive memory', () => {
    const baselineMemory = measureMemory();
    const largeMessage = 'a'.repeat(100000); // 100KB message

    const result = scanForCrisis(largeMessage);

    const afterMemory = measureMemory();
    const memoryIncrease = afterMemory - baselineMemory;

    console.log(`Large message memory increase: ${memoryIncrease.toFixed(2)}MB`);

    expect(memoryIncrease).toBeLessThan(10); // Less than 10MB
    expect(result).toBeDefined();
  });
});

// =============================================================================
// CONCURRENT REQUEST HANDLING
// =============================================================================

describe('Concurrent Processing', () => {
  test('should handle concurrent requests efficiently', async () => {
    const concurrency = 100;
    const messages = Array(concurrency).fill(null).map(() => generateRandomMessage(200));

    const start = Date.now();

    // Simulate concurrent processing
    const promises = messages.map((message) => {
      return new Promise((resolve) => {
        const result = scanForCrisis(message);
        resolve(result);
      });
    });

    await Promise.all(promises);
    const elapsed = Date.now() - start;

    console.log(`${concurrency} concurrent requests: ${elapsed}ms total, ${(elapsed / concurrency).toFixed(2)}ms average`);

    expect(elapsed).toBeLessThan(PERFORMANCE_THRESHOLDS.maxConcurrentLatency * concurrency / 10);
  });

  test('should produce consistent results under concurrent load', async () => {
    const crisisMessage = 'I want to kill myself';
    const safeMessage = 'Having a great day';

    const iterations = 100;
    const promises = [];

    for (let i = 0; i < iterations; i++) {
      promises.push(
        new Promise((resolve) => {
          const result = scanForCrisis(i % 2 === 0 ? crisisMessage : safeMessage);
          resolve({ index: i, result });
        })
      );
    }

    const results = await Promise.all(promises);

    // Verify consistency
    results.forEach(({ index, result }) => {
      if (index % 2 === 0) {
        expect(result.tier).not.toBeNull();
      } else {
        expect(result.tier).toBeNull();
      }
    });
  });
});

// =============================================================================
// PEAK LOAD SIMULATION
// =============================================================================

describe('Peak Load Simulation', () => {
  test('should handle burst of 1000 messages', () => {
    const messages = Array(1000).fill(null).map(() => generateRandomMessage(100));
    const crisisCount = 100;

    // Insert some crisis messages
    for (let i = 0; i < crisisCount; i++) {
      const randomIndex = Math.floor(Math.random() * messages.length);
      messages[randomIndex] = generateCrisisMessage(Math.ceil(Math.random() * 4));
    }

    const start = Date.now();
    let detectedCrisis = 0;

    messages.forEach((message) => {
      const result = scanForCrisis(message);
      if (result.tier !== null) {
        detectedCrisis++;
      }
    });

    const elapsed = Date.now() - start;
    const throughput = (messages.length / elapsed) * 1000;

    console.log(`Burst test: ${messages.length} messages in ${elapsed}ms (${throughput.toFixed(0)}/sec)`);
    console.log(`Detected: ${detectedCrisis} crisis messages`);

    expect(throughput).toBeGreaterThan(50); // At least 50/second even under burst
  });

  test('should handle varying message sizes', () => {
    const sizes = [10, 50, 100, 500, 1000, 5000];
    const results = [];

    sizes.forEach((size) => {
      const message = generateRandomMessage(size);
      const iterations = 100;

      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        scanForCrisis(message);
      }
      const elapsed = Date.now() - start;

      results.push({
        size,
        avgLatency: elapsed / iterations,
        throughput: (iterations / elapsed) * 1000,
      });
    });

    console.log('\nLatency by message size:');
    results.forEach(({ size, avgLatency, throughput }) => {
      console.log(`  ${size} chars: ${avgLatency.toFixed(2)}ms avg, ${throughput.toFixed(0)}/sec`);
    });

    // Latency should scale reasonably with size
    const smallLatency = results[0].avgLatency;
    const largeLatency = results[results.length - 1].avgLatency;
    const ratio = largeLatency / smallLatency;

    console.log(`\nLatency scaling ratio (5000/10 chars): ${ratio.toFixed(2)}x`);
    expect(ratio).toBeLessThan(20); // Should be less than 20x slower
  });
});

// =============================================================================
// KEYWORD SCANNING PERFORMANCE
// =============================================================================

describe('Keyword Scanning Performance', () => {
  test('should efficiently scan all 169 keywords', () => {
    const keywords = getAllKeywords();
    console.log(`Total keywords: ${keywords.length}`);

    const message = generateRandomMessage(500);
    const iterations = 100;

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      scanForCrisis(message);
    }
    const elapsed = Date.now() - start;

    const avgLatency = elapsed / iterations;
    const keywordScansPerSecond = (keywords.length * iterations) / (elapsed / 1000);

    console.log(`Keyword scanning: ${keywordScansPerSecond.toFixed(0)} keyword checks/second`);
    console.log(`Average latency with ${keywords.length} keywords: ${avgLatency.toFixed(2)}ms`);

    expect(avgLatency).toBeLessThan(10);
  });

  test('should handle worst-case scenario (many near-matches)', () => {
    // Create message with words similar to but not matching keywords
    const nearMisses = [
      'therapist', 'sharpie', 'class', 'assume', 'skilled',
      'passionate', 'classic', 'grass', 'massage', 'assess',
    ];
    const message = nearMisses.join(' ').repeat(10);

    const iterations = 100;

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      const result = scanForCrisis(message);
      expect(result.tier).toBeNull();
    }
    const elapsed = Date.now() - start;

    console.log(`Worst-case (near-miss words): ${(elapsed / iterations).toFixed(2)}ms avg`);
    expect(elapsed / iterations).toBeLessThan(20);
  });
});

// =============================================================================
// PERFORMANCE REGRESSION TESTS
// =============================================================================

describe('Performance Regression', () => {
  const benchmarks = {
    shortMessage: { target: 2, tolerance: 1 },
    mediumMessage: { target: 5, tolerance: 2 },
    longMessage: { target: 20, tolerance: 10 },
    throughput: { target: 200, tolerance: 50 }, // messages/second
  };

  test('short message latency regression', () => {
    const message = 'feeling good today';
    const iterations = 500;

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      scanForCrisis(message);
    }
    const avgLatency = (Date.now() - start) / iterations;

    const threshold = benchmarks.shortMessage.target + benchmarks.shortMessage.tolerance;
    console.log(`Short message: ${avgLatency.toFixed(2)}ms (target: <${threshold}ms)`);

    expect(avgLatency).toBeLessThan(threshold);
  });

  test('throughput regression', () => {
    const messages = Array(500).fill(generateRandomMessage(100));

    const start = Date.now();
    messages.forEach((m) => scanForCrisis(m));
    const elapsed = Date.now() - start;

    const throughput = (messages.length / elapsed) * 1000;
    const threshold = benchmarks.throughput.target - benchmarks.throughput.tolerance;

    console.log(`Throughput: ${throughput.toFixed(0)}/sec (target: >${threshold}/sec)`);

    expect(throughput).toBeGreaterThan(threshold);
  });
});

// =============================================================================
// PERFORMANCE SUMMARY
// =============================================================================

describe('Performance Summary', () => {
  test('generate performance report', () => {
    console.log('\n========== PERFORMANCE TEST SUMMARY ==========\n');

    const shortMsg = 'test message';
    const mediumMsg = generateRandomMessage(500);
    const longMsg = generateRandomMessage(5000);

    // Quick benchmark
    const measurements = {};

    // Short message
    let start = Date.now();
    for (let i = 0; i < 1000; i++) scanForCrisis(shortMsg);
    measurements.shortLatency = (Date.now() - start) / 1000;

    // Medium message
    start = Date.now();
    for (let i = 0; i < 1000; i++) scanForCrisis(mediumMsg);
    measurements.mediumLatency = (Date.now() - start) / 1000;

    // Long message
    start = Date.now();
    for (let i = 0; i < 100; i++) scanForCrisis(longMsg);
    measurements.longLatency = (Date.now() - start) / 100;

    // Throughput
    const throughputMsgs = Array(1000).fill(generateRandomMessage(100));
    start = Date.now();
    throughputMsgs.forEach((m) => scanForCrisis(m));
    measurements.throughput = (1000 / (Date.now() - start)) * 1000;

    console.log('LATENCY:');
    console.log(`  Short message (~20 chars): ${measurements.shortLatency.toFixed(3)}ms`);
    console.log(`  Medium message (~500 chars): ${measurements.mediumLatency.toFixed(3)}ms`);
    console.log(`  Long message (~5000 chars): ${measurements.longLatency.toFixed(3)}ms`);
    console.log('');
    console.log('THROUGHPUT:');
    console.log(`  Messages per second: ${measurements.throughput.toFixed(0)}`);
    console.log('');
    console.log('KEYWORD COUNT:');
    console.log(`  Total keywords: ${getAllKeywords().length}`);
    console.log('');
    console.log('==============================================\n');

    expect(true).toBe(true);
  });
});
