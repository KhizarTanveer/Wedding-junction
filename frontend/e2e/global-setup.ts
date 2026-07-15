/**
 * Global setup for Playwright E2E tests
 * Runs once before all test files
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function globalSetup(): Promise<void> {
  console.log('\n[Global Setup] Starting test preparation...');

  // Wait for backend to be ready
  const maxRetries = 30;
  let backendReady = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${API_URL}/`);
      if (response.ok) {
        backendReady = true;
        console.log('[Global Setup] Backend is ready');
        break;
      }
    } catch {
      // Backend not ready yet
    }
    if (i < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!backendReady) {
    console.warn('[Global Setup] Backend may not be running - tests may fail');
  }

  // Reset test users to clear any account locks
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-test-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      console.log(`[Global Setup] Reset test users: ${data.message}`);
    } else {
      console.warn('[Global Setup] Failed to reset test users:', await response.text());
    }
  } catch (error) {
    console.warn('[Global Setup] Could not reset test users:', error);
  }

  console.log('[Global Setup] Complete\n');
}

export default globalSetup;
