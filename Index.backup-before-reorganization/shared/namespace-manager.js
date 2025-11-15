/**
 * GLRS Namespace Manager
 * Provides safe property definition with collision prevention
 * Load this AFTER collision-detector.js, BEFORE other app scripts
 */

(function() {
  'use strict';

  /**
   * Safely define a property on window.GLRSApp
   * @param {string} name - Property name
   * @param {any} value - Property value
   * @param {Object} options - Configuration options
   * @param {boolean} options.allowOverwrite - Allow overwriting existing property
   * @param {boolean} options.writable - Make property writable
   * @param {boolean} options.configurable - Make property configurable
   */
  window.GLRSApp.define = function(name, value, options = {}) {
    const {
      allowOverwrite = false,
      writable = true,
      configurable = false,
      enumerable = true
    } = options;

    // Check for collision
    if (name in this && !allowOverwrite) {
      const error = new Error(
        `🔴 Collision prevented: GLRSApp.${name} already exists\n` +
        `   Existing type: ${typeof this[name]}\n` +
        `   New type: ${typeof value}\n` +
        `   Set allowOverwrite: true to override`
      );
      console.error(error.message);
      throw error;
    }

    // Define property with options
    Object.defineProperty(this, name, {
      value: value,
      writable: writable,
      configurable: configurable,
      enumerable: enumerable
    });

    console.log(`✅ GLRSApp.${name} defined [${typeof value}]`);
    return true;
  };

  /**
   * Freeze a namespace to prevent modifications
   */
  window.GLRSApp.freeze = function(namespace) {
    if (namespace && typeof this[namespace] === 'object') {
      Object.freeze(this[namespace]);
      console.log(`🔒 GLRSApp.${namespace} frozen`);
    } else {
      Object.freeze(this);
      console.log(`🔒 GLRSApp frozen`);
    }
  };

  console.log('✅ Namespace manager initialized');
  console.log('   Usage: window.GLRSApp.define("myProp", myValue, { writable: false })');

})();
