import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Going to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[name="username"]');

    console.log('2. Logging in as ecowokrs...');
    await page.fill('input[name="username"]', 'ecowokrs');
    await page.fill('input[name="password"]', 'test123');  // Try common password
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await page.waitForTimeout(2000);

    // Check if we're logged in by looking for logout button or redirect
    const url = page.url();
    console.log('Current URL:', url);

    if (url.includes('/login')) {
      console.log('Login may have failed. Trying alternate password...');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }

    console.log('3. Navigating to Profile page...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: '/tmp/profile-logged-in.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/profile-logged-in.png');

    console.log('4. Navigating to Draw page...');
    await page.goto('http://localhost:3000/draw');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/draw-logged-in.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/draw-logged-in.png');

    console.log('\\n5. Testing character drawing...');
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      // Draw an "X" on the canvas
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 150, { steps: 10 });
      await page.mouse.up();

      await page.mouse.move(box.x + 150, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + 150, { steps: 10 });
      await page.mouse.up();

      console.log('6. Saving drawn character...');
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: '/tmp/draw-after-save.png', fullPage: true });
      console.log('✅ Screenshot saved: /tmp/draw-after-save.png');

      console.log('\\n7. Checking Profile for updated progress...');
      await page.goto('http://localhost:3000/profile');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: '/tmp/profile-after-draw.png', fullPage: true });
      console.log('✅ Screenshot saved: /tmp/profile-after-draw.png');
    }

    console.log('\\n✨ Test complete! Check the screenshots in /tmp/');
    console.log('Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error('❌ Test failed:', err);
    await page.screenshot({ path: '/tmp/error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
