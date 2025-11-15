const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'CONSOLE_ERROR',
        message: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({
      type: 'UNCAUGHT_EXCEPTION',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('requestfailed', request => {
    errors.push({
      type: 'NETWORK_ERROR',
      url: request.url(),
      error: request.failure().errorText,
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    await page.goto('https://app.glrecoveryservices.com', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.type('input[type="email"]', 'tyer.roberts97@outlook.com');
    await page.type('input[type="password"]', 'tyty1497');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Wait 30 seconds for full React + Firebase initialization
    await new Promise(resolve => setTimeout(resolve, 30000));

    const tabs = [
      'button[data-tab="tasks"]',
      'button[data-tab="journey"]',
      'button[data-tab="home"]',
      'button[data-tab="community"]',
      'button[data-tab="profile"]'
    ];

    console.log('🔄 Clicking through tabs...');
    for (const tab of tabs) {
      try {
        await page.click(tab);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        // Tab not found, continue
      }
    }

    console.log('🔄 Triggering modal interactions...');

    // Try to click various elements that might open modals
    const interactiveSelectors = [
      // Cards and stats that might open modals
      '.stat-card',
      '.metric-card',
      '.progress-card',
      '[class*="card"]',

      // Buttons that likely open modals
      'button:not([data-tab])',
      '[role="button"]',

      // Links that might trigger modals
      'a[href="#"]',

      // Any element with "View" text
      'button:contains("View")',
      'a:contains("View")',

      // Streak/milestone elements
      '[class*="streak"]',
      '[class*="milestone"]',

      // Chart elements
      'canvas',
      '[class*="chart"]'
    ];

    for (const selector of interactiveSelectors) {
      try {
        const elements = await page.$$(selector);
        // Click first 2 elements of each type
        for (let i = 0; i < Math.min(2, elements.length); i++) {
          try {
            await elements[i].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (e) {
            // Element not clickable or stale, continue
          }
        }
      } catch (e) {
        // Selector not found, continue
      }
    }

    // Wait 10 more seconds for any delayed errors from interactions
    console.log('⏳ Waiting for delayed errors...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    fs.writeFileSync('errors.json', JSON.stringify({
      testRun: new Date().toISOString(),
      totalErrors: errors.length,
      errors: errors
    }, null, 2));

    if (errors.length === 0) {
      console.log('✅ NO ERRORS');
      process.exit(0);
    } else {
      console.log(`❌ ${errors.length} ERRORS - See errors.json`);
      process.exit(1);
    }
  } catch (error) {
    fs.writeFileSync('errors.json', JSON.stringify({
      testRun: new Date().toISOString(),
      totalErrors: 1,
      errors: [{ type: 'FATAL_ERROR', message: error.message, stack: error.stack }]
    }, null, 2));
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
