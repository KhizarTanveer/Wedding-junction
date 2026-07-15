import { Page, Locator, expect } from '@playwright/test';

export class ResetPasswordPage {
  readonly page: Page;

  // Form inputs
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly resetButton: Locator;

  // Feedback messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly tokenExpiredMessage: Locator;
  readonly tokenInvalidMessage: Locator;

  // Navigation links
  readonly loginLink: Locator;
  readonly requestNewLinkButton: Locator;

  // Page elements
  readonly pageTitle: Locator;
  readonly formContainer: Locator;

  // Password requirements
  readonly passwordRequirements: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page structure
    this.pageTitle = page.locator('h1, h2').filter({ hasText: /Reset.*Password|New Password|Create.*Password/i });
    this.formContainer = page.locator('form').first();

    // Form inputs
    this.newPasswordInput = page.locator('input[name="password"], input[name="newPassword"]').or(
      page.getByPlaceholder(/New Password|Enter.*password/i)
    ).or(
      page.getByLabel(/^New Password$/i)
    );
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').or(
      page.getByPlaceholder(/Confirm.*Password/i)
    ).or(
      page.getByLabel(/Confirm.*Password/i)
    );
    this.resetButton = page.getByRole('button', { name: /Reset.*Password|Set.*Password|Submit/i });

    // Success/Error messages
    this.successMessage = page.locator('.bg-green-50, [role="alert"]').filter({
      hasText: /success|password.*reset|password.*changed/i,
    });
    this.errorMessage = page.locator('.bg-red-50, [role="alert"]');
    this.tokenExpiredMessage = page.locator('.bg-red-50, [role="alert"], p').filter({
      hasText: /expired|link.*expired/i,
    });
    this.tokenInvalidMessage = page.locator('.bg-red-50, [role="alert"], p').filter({
      hasText: /invalid|link.*invalid/i,
    });

    // Password requirements hint
    this.passwordRequirements = page.locator('p, ul').filter({
      hasText: /at least|characters|uppercase|lowercase|number/i,
    });

    // Navigation
    this.loginLink = page.getByRole('link', { name: /Login|Sign In|Back to Login/i });
    this.requestNewLinkButton = page.getByRole('button', { name: /Request.*Link|New Link|Resend/i }).or(
      page.getByRole('link', { name: /Request.*Link|Forgot Password/i })
    );
  }

  async goto(token: string): Promise<void> {
    await this.page.goto(`/reset-password?token=${token}`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoWithPath(token: string): Promise<void> {
    await this.page.goto(`/reset-password/${token}`);
    await this.page.waitForLoadState('networkidle');
  }

  async resetPassword(newPassword: string, confirmPassword: string): Promise<void> {
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.resetButton.click();
  }

  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.resetButton.click();
  }

  async expectSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async expectTokenExpired(): Promise<void> {
    await expect(this.tokenExpiredMessage).toBeVisible({ timeout: 10000 });
  }

  async expectTokenInvalid(): Promise<void> {
    await expect(this.tokenInvalidMessage).toBeVisible({ timeout: 10000 });
  }

  async expectPasswordMismatch(): Promise<void> {
    const mismatchError = this.page.locator('.text-red-500, .text-red-600, [role="alert"]').filter({
      hasText: /match|don't match|do not match/i,
    });
    await expect(mismatchError).toBeVisible({ timeout: 5000 });
  }

  async expectWeakPassword(): Promise<void> {
    const weakError = this.page.locator('.text-red-500, .text-red-600, [role="alert"]').filter({
      hasText: /weak|too short|at least|characters|requirements/i,
    });
    await expect(weakError).toBeVisible({ timeout: 5000 });
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage.filter({ hasText: message })).toBeVisible({ timeout: 5000 });
  }

  async clickLoginLink(): Promise<void> {
    await this.loginLink.click();
    await expect(this.page).toHaveURL('/login');
  }

  async clickRequestNewLink(): Promise<void> {
    await this.requestNewLinkButton.click();
  }

  async isFormVisible(): Promise<boolean> {
    return await this.newPasswordInput.isVisible();
  }

  async isResetButtonEnabled(): Promise<boolean> {
    return await this.resetButton.isEnabled();
  }

  async expectPageLoaded(): Promise<void> {
    // Either form is visible or an error/expired message is shown
    const formOrError = this.newPasswordInput.or(this.tokenExpiredMessage).or(this.tokenInvalidMessage);
    await expect(formOrError).toBeVisible({ timeout: 10000 });
  }

  async expectRedirectToLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/login/i, { timeout: 10000 });
  }
}
