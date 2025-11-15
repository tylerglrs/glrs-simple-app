/**
 * GLRS Collision Detector
 * Monitors window.GLRSApp for namespace collisions at runtime
 * Load this FIRST (after Firebase, before config.js)
 */

(function () {
  'use strict';

  const collisionLog = [];
  let detectionEnabled = true;

  // Create proxy handler
  const handler = {
    set(target, property, value) {
      if (property in target && detectionEnabled) {
        const collision = {
          property: `window.GLRSApp.${property}`,
          existingType: typeof target[property],
          existingValue: target[property],
          newType: typeof value,
          newValue: value,
          timestamp: new Date().toISOString(),
          stackTrace: new Error().stack
        };
        collisionLog.push(collision);
        console.error('🔴 NAMESPACE COLLISION DETECTED!');
        console.error(`   Property: window.GLRSApp.${property}`);
        console.error(`   Existing: [${typeof target[property]}]`, target[property]);
        console.error(`   New: [${typeof value}]`, value);
        console.trace('Collision stack trace:');

        // Don't block the assignment, but log it
      }
      target[property] = value;
      return true;
    },
    get(target, property) {
      // Allow access to collision report and control methods
      if (property === '__collisionReport') {
        return () => {
          console.log('📊 Collision Report:');
          console.log(`   Total collisions: ${collisionLog.length}`);
          console.table(collisionLog.map(c => ({
            Property: c.property,
            Existing: c.existingType,
            New: c.newType,
            Time: c.timestamp
          })));
          return collisionLog;
        };
      }
      if (property === '__disableDetection') {
        return () => {
          detectionEnabled = false;
        };
      }
      if (property === '__enableDetection') {
        return () => {
          detectionEnabled = true;
        };
      }
      return target[property];
    }
  };

  // Initialize GLRSApp with proxy
  window.GLRSApp = new Proxy(window.GLRSApp || {}, handler);
  console.log('✅ Collision detector initialized');
  console.log('   Access report: window.GLRSApp.__collisionReport()');
})();