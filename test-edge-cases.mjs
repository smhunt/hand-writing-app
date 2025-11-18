import { chromium } from 'playwright';

/**
 * Edge case testing for drawing workflow
 * Tests: multiple saves, session persistence, rate limiting
 */

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging from the page
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 BROWSER ERROR:', msg.text());
    } else if (msg.text().includes('Save error') || msg.text().includes('Non-JSON')) {
      console.log('⚠️  BROWSER LOG:', msg.text());
    }
  });

  // Capture network requests
  let requestCount = 0;
  let saveCharRequests = [];

  page.on('request', request => {
    if (request.url().includes('/api/save-char')) {
      requestCount++;
      console.log(`📤 Request #${requestCount}: POST /api/save-char`);
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/save-char')) {
      const status = response.status();
      const contentType = response.headers()['content-type'];
      console.log(`📥 Response #${saveCharRequests.length + 1}:`, {
        status,
        contentType,
        ok: response.ok()
      });

      try {
        const body = await response.text();
        saveCharRequests.push({
          request: requestCount,
          status,
          contentType,
          bodyPreview: body.substring(0, 100)
        });

        if (!contentType?.includes('application/json')) {
          console.log('❌ NON-JSON RESPONSE DETECTED!');
          console.log('   Status:', status);
          console.log('   Content-Type:', contentType);
          console.log('   Body:', body);
        }
      } catch (err) {
        console.log('   Error reading response:', err.message);
      }
    }
  });

  try {
    console.log('🧪 Edge Case Testing - Drawing Multiple Characters\n');

    // Register new user
    console.log('1. Creating new test user...');
    await page.goto('http://localhost:3000/register');
    await page.waitForTimeout(2000);

    const username = 'edgetest_' + Date.now();
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    console.log(`✅ Registered: ${username}\n`);

    // Go to profile
    await page.goto('http://localhost:3000/profile');
    await page.waitForTimeout(2000);

    console.log('2. Opening modal for character A...');
    const charA = await page.$('button:has-text("A")');
    if (charA) {
      await charA.click();
      await page.waitForTimeout(1000);
    }

    console.log('✅ Modal opened\n');
    console.log('3. Starting rapid-fire character drawing test...\n');

    // Draw 20 characters rapidly to test for issues
    for (let i = 0; i < 20; i++) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`   CHARACTER ${i + 1}/20`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Get current character from modal
      const modalTitle = await page.$('h3.text-xl');
      let currentChar = 'unknown';
      if (modalTitle) {
        const text = await modalTitle.textContent();
        const match = text.match(/Draw Character:\s*(\S)/);
        if (match) currentChar = match[1];
        console.log(`   Drawing: ${currentChar}`);
      }

      // Check if modal is still open
      const modal = await page.$('.fixed.inset-0.bg-black');
      if (!modal) {
        console.log('   ❌ Modal closed unexpectedly!');
        break;
      }

      // Draw on canvas
      const canvas = await page.$('canvas');
      if (canvas) {
        const box = await canvas.boundingBox();

        // Quick drawing
        await page.mouse.move(box.x + 50, box.y + 50);
        await page.mouse.down();
        await page.mouse.move(box.x + 100, box.y + 100, { steps: 3 });
        await page.mouse.up();

        console.log('   ✏️  Drew strokes');
      }

      // Click Next (auto-save)
      const nextBtn = await page.$('button:has-text("Next")');
      if (nextBtn) {
        console.log('   💾 Clicking Next (auto-save)...');
        await nextBtn.click();

        // Wait for response
        await page.waitForTimeout(2000);

        // Check for error message
        const errorMsg = await page.$('text=/Error:/i');
        if (errorMsg) {
          const errorText = await errorMsg.textContent();
          console.log('   ❌ ERROR DETECTED:', errorText);

          await page.screenshot({
            path: `/tmp/edge-test-error-char-${i + 1}.png`,
            fullPage: true
          });

          console.log(`   📸 Screenshot saved: /tmp/edge-test-error-char-${i + 1}.png`);
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('   STOPPING TEST - Error encountered');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          break;
        }

        console.log('   ✅ Save successful');
      }

      console.log('');
    }

    // Summary
    console.log('\n═══════════════════════════════════════');
    console.log('   TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total save-char requests: ${requestCount}`);
    console.log(`Responses received: ${saveCharRequests.length}`);
    console.log('');

    // Analyze responses
    const nonJsonResponses = saveCharRequests.filter(r => !r.contentType?.includes('application/json'));
    const errorResponses = saveCharRequests.filter(r => r.status !== 200);

    if (nonJsonResponses.length > 0) {
      console.log(`❌ Non-JSON responses: ${nonJsonResponses.length}`);
      nonJsonResponses.forEach((r, idx) => {
        console.log(`   ${idx + 1}. Request #${r.request}: ${r.status} ${r.contentType}`);
        console.log(`      Body: ${r.bodyPreview}`);
      });
    } else {
      console.log('✅ All responses were JSON');
    }

    if (errorResponses.length > 0) {
      console.log(`❌ Error responses: ${errorResponses.length}`);
      errorResponses.forEach((r, idx) => {
        console.log(`   ${idx + 1}. Request #${r.request}: ${r.status}`);
      });
    } else {
      console.log('✅ All responses were 200 OK');
    }

    console.log('');
    console.log('⏳ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error('❌ Test crashed:', err);
    await page.screenshot({ path: '/tmp/edge-test-crash.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();
