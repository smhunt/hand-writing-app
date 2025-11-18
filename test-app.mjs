import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Collect errors
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Wait a bit for app to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/app-home.png', fullPage: true });
    console.log('Screenshot saved to /tmp/app-home.png');

    // Check if logged in
    const loginButton = await page.$('text=Login');
    if (loginButton) {
      console.log('\\nUser not logged in. Attempting login...');
      await loginButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/app-login.png', fullPage: true });
      console.log('Login page screenshot: /tmp/app-login.png');

      // Try to login
      const usernameInput = await page.$('input[name="username"]');
      if (usernameInput) {
        await usernameInput.fill('ecowokrs');
        const passwordInput = await page.$('input[name="password"]');
        await passwordInput.fill('password');
        const submitButton = await page.$('button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Navigate to Profile page
    console.log('\\nNavigating to Profile page...');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/app-profile.png', fullPage: true });
    console.log('Profile page screenshot: /tmp/app-profile.png');

    // Navigate to Draw page
    console.log('\\nNavigating to Draw page...');
    await page.goto('http://localhost:3000/draw', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/app-draw.png', fullPage: true });
    console.log('Draw page screenshot: /tmp/app-draw.png');

    // Print console messages
    console.log('\\n=== Console Messages ===');
    consoleMessages.forEach(msg => console.log(msg));

    // Print errors
    if (errors.length > 0) {
      console.log('\\n=== Errors ===');
      errors.forEach(err => console.log(err));
    } else {
      console.log('\\n=== No JavaScript Errors ===');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    console.log('\\nClosing browser...');
    await browser.close();
  }
})();
