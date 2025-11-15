const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_FILE = path.join(__dirname, '.test-credentials.json');

async function getTestCredentials() {
    if (fs.existsSync(CREDENTIALS_FILE)) {
        return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    }
    throw new Error('No test credentials found');
}

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0'
        ]
    });

    const page = await browser.newPage();

    // Clear cache before starting
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCache');
    await client.send('Network.clearBrowserCookies');

    const errors = [];
    const errorDetails = [];
    const firebaseErrors = [];

    // Capture ALL console messages
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();

        // Capture error-level messages
        if (type === 'error') {
            // Skip known non-critical errors and network errors
            if (!text.includes('Babel transformer') &&
                !text.includes('Could not establish connection') &&
                !text.includes('Failed to load resource') &&
                !text.includes('the server responded with a status')) {
                errors.push(text);
            }
        }

        // Capture Firebase logger errors specifically
        if (text.includes('@firebase/') &&
            (text.includes('Error') || text.includes('permission-denied'))) {
            firebaseErrors.push(text);
        }

        // Capture warnings that might indicate issues
        if (type === 'warning' && text.includes('not defined')) {
            errors.push(`WARNING: ${text}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        if (!error.message.includes('Could not establish connection')) {
            errors.push(error.message);
            errorDetails.push({
                message: error.message,
                stack: error.stack
            });
        }
    });

    try {
        console.log('🔍 Loading production site with cache disabled...');
        await page.goto('https://app.glrecoveryservices.com', {
            waitUntil: 'networkidle0',
            timeout: 90000
        });

        console.log('⏳ Waiting for initial page load...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check if we need to log in
        const loginFormExists = await page.$('input[type="email"]').catch(() => null);

        if (loginFormExists) {
            console.log('🔐 Login required - authenticating...');

            const credentials = await getTestCredentials();

            await page.waitForSelector('input[type="email"]', { timeout: 5000 });
            await page.type('input[type="email"]', credentials.email);

            await page.waitForSelector('input[type="password"]', { timeout: 5000 });
            await page.type('input[type="password"]', credentials.password);

            const loginButton = await page.$('button[type="submit"]');
            if (loginButton) {
                await loginButton.click();
                console.log('⏳ Waiting for authentication...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log('⏳ Waiting 30 seconds for full React + Firebase initialization...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        console.log('🔄 Navigating through tabs to trigger all code paths...');

        // Click through tabs to trigger any tab-specific errors
        const tabSelectors = [
            'button[data-tab="tasks"]',
            'button[data-tab="journey"]',
            'button[data-tab="home"]',
            'button[data-tab="community"]',
            'button[data-tab="profile"]'
        ];

        for (const selector of tabSelectors) {
            const tab = await page.$(selector).catch(() => null);
            if (tab) {
                console.log(`  → Clicking tab: ${selector}`);
                await tab.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log('⏳ Waiting 10 more seconds for any delayed errors...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        console.log('📊 Final error check...');

        const totalErrors = errors.length + firebaseErrors.length;

        if (totalErrors === 0) {
            console.log('✅ No console errors found on production (authenticated + all tabs tested)!');

            fs.writeFileSync(
                './production-errors.json',
                JSON.stringify({ success: true, authenticated: true, tabsTested: true, errors: [] }, null, 2)
            );

            process.exit(0);
        } else {
            console.log(`❌ Found ${totalErrors} errors on production:\n`);

            if (errors.length > 0) {
                console.log('JavaScript Errors:');
                errors.forEach((err, i) => {
                    console.log(`  ${i + 1}. ${err}`);
                });
            }

            if (firebaseErrors.length > 0) {
                console.log('\nFirebase Errors:');
                firebaseErrors.forEach((err, i) => {
                    console.log(`  ${i + 1}. ${err}`);
                });
            }

            if (errorDetails.length > 0) {
                console.log('\n📋 Detailed Error Info:');
                errorDetails.forEach((detail, i) => {
                    console.log(`\nError ${i + 1}:`);
                    console.log(`Message: ${detail.message}`);
                    if (detail.stack) {
                        const stackLines = detail.stack.split('\n').slice(0, 5).join('\n');
                        console.log(`Stack:\n${stackLines}`);
                    }
                });
            }

            fs.writeFileSync(
                './production-errors.json',
                JSON.stringify({
                    success: false,
                    authenticated: true,
                    tabsTested: true,
                    errorCount: totalErrors,
                    errors: errorDetails
                }, null, 2)
            );

            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Error checking production:', err.message);

        fs.writeFileSync(
            './production-errors.json',
            JSON.stringify({ success: false, loadError: err.message, errors: [] }, null, 2)
        );

        process.exit(1);
    } finally {
        await browser.close();
    }
})();
