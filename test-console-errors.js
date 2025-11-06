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
        type: 'console.error',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({
      type: 'page.error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('requestfailed', request => {
    errors.push({
      type: 'request.failed',
      url: request.url(),
      error: request.failure().errorText,
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('🚀 Loading app from Firebase emulator...');

    await page.goto('http://localhost:5003', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✅ App DOM loaded, waiting for errors...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} error(s):`);
      errors.forEach((err, index) => {
        console.log(`\n--- Error ${index + 1} ---`);
        console.log(`Type: ${err.type}`);
        console.log(`Message: ${err.message}`);
        if (err.stack) console.log(`Stack: ${err.stack}`);
        if (err.url) console.log(`URL: ${err.url}`);
      });
      
      fs.writeFileSync(
        './console-errors.json',
        JSON.stringify(errors, null, 2)
      );
      
      process.exit(1);
    } else {
      console.log('✅ No console errors found!');
      
      fs.writeFileSync(
        './console-errors.json',
        JSON.stringify({ success: true, errors: [] }, null, 2)
      );
      
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Failed to load app:', error.message);
    
    fs.writeFileSync(
      './console-errors.json',
      JSON.stringify({
        success: false,
        loadError: error.message,
        errors: errors
      }, null, 2)
    );
    
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
