/**
 * API-only test for drawing workflow
 * Tests backend functionality without browser
 */

const BASE_URL = 'http://localhost:5001';

async function test() {
  console.log('🧪 Testing Drawing Workflow API\n');

  let sessionCookie = null;

  try {
    // Test 1: Register new user
    console.log('1. Testing user registration...');
    const username = 'apitest_' + Date.now();
    const registerRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'test123' })
    });

    if (!registerRes.ok) {
      throw new Error(`Registration failed: ${registerRes.status}`);
    }

    // Extract session cookie
    const setCookie = registerRes.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }

    const registerData = await registerRes.json();
    console.log(`✅ Registered user: ${registerData.user.username}`);
    console.log(`   Session cookie: ${sessionCookie ? 'Yes' : 'No'}\n`);

    // Test 2: Check initial profile
    console.log('2. Checking initial profile...');
    const profileRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { 'Cookie': sessionCookie }
    });

    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed: ${profileRes.status}`);
    }

    const profileData = await profileRes.json();
    console.log(`✅ Profile loaded`);
    console.log(`   Characters: ${profileData.stats.total}/73`);
    console.log(`   Vector: ${profileData.stats.vector}`);
    console.log(`   Image: ${profileData.stats.image}\n`);

    // Test 3: Save multiple characters rapidly
    console.log('3. Testing rapid character saves (20 characters)...\n');

    const characters = 'ABCDEFGHIJKLMNOPQRST'.split('');
    let successCount = 0;
    let errorCount = 0;
    let errors = [];

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];

      // Create dummy stroke data
      const strokes = [
        [
          { x: 50, y: 50 },
          { x: 100, y: 100 },
          { x: 150, y: 150 }
        ]
      ];

      try {
        const saveRes = await fetch(`${BASE_URL}/api/save-char`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
          },
          body: JSON.stringify({ char, strokes })
        });

        const contentType = saveRes.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          const text = await saveRes.text();
          errorCount++;
          errors.push({
            char: i + 1,
            letter: char,
            status: saveRes.status,
            contentType,
            body: text.substring(0, 100)
          });
          console.log(`   ${i + 1}. ${char} - ❌ Non-JSON response (${saveRes.status})`);
          continue;
        }

        const saveData = await saveRes.json();

        if (!saveRes.ok) {
          errorCount++;
          errors.push({
            char: i + 1,
            letter: char,
            error: saveData.error
          });
          console.log(`   ${i + 1}. ${char} - ❌ ${saveData.error}`);
        } else {
          successCount++;
          console.log(`   ${i + 1}. ${char} - ✅ Saved`);
        }

        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        errorCount++;
        errors.push({
          char: i + 1,
          letter: char,
          error: err.message
        });
        console.log(`   ${i + 1}. ${char} - ❌ ${err.message}`);
      }
    }

    console.log('\n4. Checking final profile...');
    const finalProfileRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { 'Cookie': sessionCookie }
    });

    if (finalProfileRes.ok) {
      const finalData = await finalProfileRes.json();
      console.log(`✅ Final profile loaded`);
      console.log(`   Characters: ${finalData.stats.total}/73`);
      console.log(`   Vector: ${finalData.stats.vector}`);
      console.log(`   Expected: ${successCount}\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('   TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total attempts: ${characters.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('');

    if (errorCount > 0) {
      console.log('ERRORS DETECTED:');
      errors.forEach(err => {
        console.log(`\n   Character #${err.char} (${err.letter}):`);
        if (err.contentType) {
          console.log(`   Status: ${err.status}`);
          console.log(`   Content-Type: ${err.contentType}`);
          console.log(`   Body: ${err.body}`);
        } else {
          console.log(`   Error: ${err.error}`);
        }
      });
      console.log('');
      console.log('❌ TEST FAILED - Issues found');
    } else {
      console.log('✅ ALL TESTS PASSED');
      console.log('✅ No rate limiting issues');
      console.log('✅ All responses were JSON');
      console.log('✅ All characters saved successfully');
    }

  } catch (err) {
    console.error('\n❌ Test crashed:', err.message);
    console.error(err);
  }
}

test();
