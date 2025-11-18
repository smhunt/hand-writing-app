import { chromium } from 'playwright';

/**
 * Quick test: Modal auto-advance workflow with existing user
 */

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 Testing Modal Auto-Advance Functionality\n');

    // Navigate directly to profile (assuming session exists or bypassing auth for test)
    console.log('1. Navigating to Profile page...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForTimeout(3000);

    // Check if we're redirected to login
    const url = page.url();
    if (url.includes('/login')) {
      console.log('2. Need to login first...');

      // Check if we have Auth0 or custom login
      const usernameInput = await page.$('input[name="username"]');
      const auth0Login = await page.$('text=/Sign in to/i');

      if (auth0Login) {
        console.log('❌ Auth0 detected - skipping test (requires manual auth)');
        await browser.close();
        return;
      }

      if (usernameInput) {
        await page.fill('input[name="username"]', 'ecowokrs');
        await page.fill('input[name="password"]', 'test123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

        // Navigate back to profile
        await page.goto('http://localhost:3000/profile');
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: '/tmp/auto-advance-start.png', fullPage: true });
    console.log('📸 Initial state captured\n');

    // Check current progress
    console.log('3. Checking current progress...');
    const totalStat = await page.$('.text-blue-700');
    if (totalStat) {
      const total = await totalStat.textContent();
      console.log(`   Current: ${total}/73 characters\n`);
    }

    // Find first incomplete character
    console.log('4. Finding first incomplete character...');
    const incompleteChars = await page.$$('button.bg-gray-50');

    if (incompleteChars.length === 0) {
      console.log('⚠️  All characters already complete! Test complete.');
      await browser.close();
      return;
    }

    const firstIncomplete = incompleteChars[0];
    const char1 = await firstIncomplete.textContent();
    console.log(`   Found: "${char1}"\n`);

    // Click to open modal
    console.log('5. Opening modal for character:', char1);
    await firstIncomplete.click();
    await page.waitForTimeout(1000);

    // Verify modal opened
    const modal = await page.$('.fixed.inset-0.bg-black');
    if (!modal) {
      console.log('❌ Modal did not open');
      await browser.close();
      return;
    }
    console.log('✅ Modal opened\n');

    // Draw on canvas
    console.log('6. Drawing character...');
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();

      // Draw a simple shape
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 150, { steps: 10 });
      await page.mouse.up();

      console.log('✅ Drawing complete\n');
      await page.screenshot({ path: '/tmp/auto-advance-drawn.png', fullPage: true });
    }

    // Click "Next" button (should auto-save)
    console.log('7. Clicking Next button (should auto-save)...');
    const nextButton = await page.$('button:has-text("Next")');
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(3000); // Wait for save and auto-advance

      console.log('✅ Next clicked\n');
    }

    // Check if modal is still open with new character
    console.log('8. Verifying modal auto-advanced...');
    const modalStillOpen = await page.$('.fixed.inset-0.bg-black');

    if (modalStillOpen) {
      console.log('✅ Modal stayed open!');

      // Get the new character
      const modalTitle = await page.$('h3.text-xl');
      if (modalTitle) {
        const titleText = await modalTitle.textContent();
        console.log(`✅ Modal now showing: ${titleText}`);

        // Check if it's a different character
        if (!titleText.includes(char1)) {
          console.log('✅ AUTO-ADVANCE WORKING! Character changed from', char1);
        } else {
          console.log('⚠️  Character did not change - may still be same');
        }
      }

      await page.screenshot({ path: '/tmp/auto-advance-next-char.png', fullPage: true });
      console.log('\n9. Drawing second character to verify continuous flow...');

      // Draw second character
      const canvas2 = await page.$('canvas');
      if (canvas2) {
        const box2 = await canvas2.boundingBox();

        await page.mouse.move(box2.x + 75, box2.y + 75);
        await page.mouse.down();
        await page.mouse.move(box2.x + 125, box2.y + 125, { steps: 8 });
        await page.mouse.up();

        console.log('✅ Second character drawn');

        // Click Next again
        const nextButton2 = await page.$('button:has-text("Next")');
        if (nextButton2) {
          await nextButton2.click();
          await page.waitForTimeout(3000);
          console.log('✅ Second Next clicked');
        }
      }

      await page.screenshot({ path: '/tmp/auto-advance-second-char.png', fullPage: true });

    } else {
      console.log('❌ Modal closed - auto-advance not working');
    }

    // Close modal manually
    console.log('\n10. Closing modal to check progress update...');
    const closeButton = await page.$('button:has-text("×")');
    if (closeButton) {
      await closeButton.click();
      await page.waitForTimeout(1500);
      console.log('✅ Modal closed');
    }

    // Check updated progress
    const updatedTotal = await page.$('.text-blue-700');
    if (updatedTotal) {
      const total = await updatedTotal.textContent();
      console.log(`✅ Final progress: ${total}/73 characters`);
    }

    await page.screenshot({ path: '/tmp/auto-advance-final.png', fullPage: true });

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 Test Complete!');
    console.log('═══════════════════════════════════════');
    console.log('📸 Screenshots saved:');
    console.log('   /tmp/auto-advance-start.png');
    console.log('   /tmp/auto-advance-drawn.png');
    console.log('   /tmp/auto-advance-next-char.png');
    console.log('   /tmp/auto-advance-second-char.png');
    console.log('   /tmp/auto-advance-final.png');
    console.log('');

    console.log('⏳ Keeping browser open for 8 seconds...');
    await page.waitForTimeout(8000);

  } catch (err) {
    console.error('❌ Test failed:', err);
    await page.screenshot({ path: '/tmp/auto-advance-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();
