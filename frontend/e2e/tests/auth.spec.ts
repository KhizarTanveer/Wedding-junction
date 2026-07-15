import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { HomePage } from '../pages/HomePage';
import { testUser, testAdmin, generateUniqueEmail } from '../fixtures/test-data';
import { login, logout, isLoggedIn, resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Authentication', () => {
  // Reset test users before each test to clear any account locks
  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(testUser.email, testUser.password);

      // Should redirect to home page
      await expect(page).toHaveURL('/');

      // Should have auth token in localStorage
      const hasToken = await isLoggedIn(page);
      expect(hasToken).toBe(true);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login('wrong@email.com', 'wrongpassword');

      // Should show error message
      await loginPage.expectErrorMessage('Invalid credentials');

      // Should still be on login page
      await expect(page).toHaveURL('/login');
    });

    test('should show error for empty fields', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Click sign in without filling form
      await loginPage.signInButton.click();

      // HTML5 validation should prevent submission
      await expect(page).toHaveURL('/login');
    });

    test('should toggle password visibility', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Password should be hidden by default
      expect(await loginPage.isPasswordVisible()).toBe(false);

      // Toggle visibility
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // Toggle back
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(false);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.clickForgotPassword();

      await expect(page).toHaveURL('/forgot-password');
    });

    test('should navigate to signup page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.clickCreateAccount();

      await expect(page).toHaveURL('/signup');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      // Try to access bookings page without being logged in
      await page.goto('/bookings');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing chat without auth', async ({ page }) => {
      await page.goto('/chat');

      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing vendor dashboard without auth', async ({ page }) => {
      await page.goto('/vendor');

      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing admin without auth', async ({ page }) => {
      await page.goto('/admin');

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      await login(page, testUser.email, testUser.password);

      // Verify logged in
      expect(await isLoggedIn(page)).toBe(true);

      // Logout
      await logout(page);

      // Should be logged out
      expect(await isLoggedIn(page)).toBe(false);
    });

    test('should clear user data on logout', async ({ page }) => {
      // Login first
      await login(page, testUser.email, testUser.password);

      // Logout
      await logout(page);

      // Verify localStorage is cleared
      const currentUser = await page.evaluate(() => localStorage.getItem('currentUser'));
      const token = await page.evaluate(() => localStorage.getItem('token'));

      expect(currentUser).toBeNull();
      expect(token).toBeNull();
    });
  });

  test.describe('Forgot Password', () => {
    test('should show forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      // Should have email input (placeholder is "you@example.com")
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible();

      // Should have submit button
      await expect(page.getByRole('button', { name: /reset|send/i })).toBeVisible();
    });

    test('should submit forgot password request', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.getByPlaceholder('you@example.com').fill(testUser.email);
      await page.getByRole('button', { name: /reset|send/i }).click();

      // Should show success message or confirmation
      await expect(page.locator('.bg-emerald-50')).toBeVisible({ timeout: 10000 });
    });

    test('should handle non-existent email gracefully', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.getByPlaceholder('you@example.com').fill('nonexistent@email.com');
      await page.getByRole('button', { name: /reset|send/i }).click();

      // API returns success to prevent email enumeration attacks
      // Should show success or generic message
      await expect(page.locator('.bg-emerald-50, .text-emerald-600, .bg-green-50')).toBeVisible({ timeout: 10000 });
    });
  });
});

test.describe('User Signup', () => {
  // Reset test users before each test
  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test('should create new user account', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    const uniqueEmail = generateUniqueEmail('newuser');
    const userData = {
      name: 'New Test User',
      email: uniqueEmail,
      password: 'TestPassword123!',
    };

    await signupPage.signupUser(userData);

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should be logged in
    expect(await isLoggedIn(page)).toBe(true);
  });

  test('should show validation errors for short name', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.selectUserType();
    await signupPage.nameInput.fill('A'); // Too short
    await signupPage.emailInput.fill('test@example.com');
    await signupPage.passwordInput.fill('password123');
    await signupPage.confirmPasswordInput.fill('password123');
    await signupPage.acceptTerms();
    await signupPage.createAccountButton.click();

    await signupPage.expectErrorMessage('at least 2 characters');
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.selectUserType();
    await signupPage.nameInput.fill('Test User');
    await signupPage.emailInput.fill('invalid-email');
    await signupPage.passwordInput.fill('password123');
    await signupPage.confirmPasswordInput.fill('password123');
    await signupPage.acceptTerms();
    await signupPage.createAccountButton.click();

    await signupPage.expectErrorMessage('valid email');
  });

  test('should show validation errors for short password', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.selectUserType();
    await signupPage.nameInput.fill('Test User');
    await signupPage.emailInput.fill('test@example.com');
    await signupPage.passwordInput.fill('12345'); // Too short
    await signupPage.confirmPasswordInput.fill('12345');
    await signupPage.acceptTerms();
    await signupPage.createAccountButton.click();

    await signupPage.expectErrorMessage('at least 6 characters');
  });

  test('should show validation errors for password mismatch', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.selectUserType();
    await signupPage.nameInput.fill('Test User');
    await signupPage.emailInput.fill('test@example.com');
    await signupPage.passwordInput.fill('password123');
    await signupPage.confirmPasswordInput.fill('differentpassword');
    await signupPage.acceptTerms();
    await signupPage.createAccountButton.click();

    await signupPage.expectErrorMessage('do not match');
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    // Try to register with existing email
    await signupPage.selectUserType();
    await signupPage.nameInput.fill('Test User');
    await signupPage.emailInput.fill(testUser.email); // Existing email
    await signupPage.passwordInput.fill('password123456');
    await signupPage.confirmPasswordInput.fill('password123456');
    await signupPage.acceptTerms();
    await signupPage.createAccountButton.click();

    // Should show error about duplicate email
    await signupPage.expectErrorMessage(/already|exists|registered/i);
  });

  test('should navigate to login page from signup', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.signInLink.click();

    await expect(page).toHaveURL('/login');
  });
});
