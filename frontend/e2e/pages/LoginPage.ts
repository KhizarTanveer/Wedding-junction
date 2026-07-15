import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signInButton: Locator;
  readonly createAccountLink: Locator;
  readonly errorMessage: Locator;

  // Lockout-related locators
  readonly lockoutMessage: Locator;
  readonly attemptsWarning: Locator;
  readonly unlockTime: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('you@example.com');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.showPasswordButton = page.getByRole('button', { name: /Show|Hide/ });
    this.rememberMeCheckbox = page.getByLabel('Remember me');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.createAccountLink = page.getByRole('link', { name: 'Create Account' });
    this.errorMessage = page.locator('.bg-red-50');

    // Lockout-related locators
    this.lockoutMessage = page.locator('.bg-red-50, [role="alert"]').filter({
      hasText: /locked|too many attempts|temporarily blocked/i,
    });
    this.attemptsWarning = page.locator('.bg-red-50, .bg-yellow-50, [role="alert"]').filter({
      hasText: /attempt|remaining|left/i,
    });
    this.unlockTime = page.locator('p, span').filter({
      hasText: /unlock|try again|minutes|hours/i,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async loginAndWait(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await expect(this.page).not.toHaveURL('/login');
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.showPasswordButton.click();
  }

  async checkRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.check();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await expect(this.page).toHaveURL('/forgot-password');
  }

  async clickCreateAccount(): Promise<void> {
    await this.createAccountLink.click();
    await expect(this.page).toHaveURL('/signup');
  }

  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return (await this.errorMessage.textContent()) || '';
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async isPasswordVisible(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'text';
  }

  // Lockout-related methods
  async expectLockout(): Promise<void> {
    await expect(this.lockoutMessage).toBeVisible({ timeout: 10000 });
  }

  async expectAttemptsWarning(remaining?: number): Promise<void> {
    await expect(this.attemptsWarning).toBeVisible({ timeout: 5000 });
    if (remaining !== undefined) {
      await expect(this.attemptsWarning).toContainText(remaining.toString());
    }
  }

  async getLockoutDuration(): Promise<string> {
    const text = await this.unlockTime.textContent();
    if (text) {
      // Extract time like "2 hours" or "30 minutes"
      const match = text.match(/\d+\s*(hour|minute|second)s?/i);
      return match ? match[0] : text.trim();
    }
    return '';
  }

  async isLockedOut(): Promise<boolean> {
    return await this.lockoutMessage.isVisible();
  }

  async getRemainingAttempts(): Promise<number> {
    const text = await this.attemptsWarning.textContent();
    if (text) {
      const match = text.match(/(\d+)\s*attempt/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return -1;
  }

  async loginWithCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async attemptLoginMultipleTimes(
    email: string,
    wrongPassword: string,
    attempts: number
  ): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      await this.goto();
      await this.loginWithCredentials(email, wrongPassword);
      // Wait for response
      await this.page.waitForSelector('.bg-red-50, [role="alert"]', { timeout: 5000 }).catch(() => {});
    }
  }
}
