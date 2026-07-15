import { Page, Locator, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  // Profile form
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly avatarUpload: Locator;
  readonly avatarPreview: Locator;
  readonly removeAvatarButton: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  // Change password section
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly changePasswordButton: Locator;
  readonly passwordSuccessMessage: Locator;
  readonly passwordErrorMessage: Locator;

  // Delete account section
  readonly deleteAccountButton: Locator;
  readonly deleteConfirmInput: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;
  readonly deleteModal: Locator;

  // Page elements
  readonly pageTitle: Locator;
  readonly profileSection: Locator;
  readonly passwordSection: Locator;
  readonly deleteSection: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements
    this.pageTitle = page.locator('h1').filter({ hasText: /Profile|Account|Settings/i });
    this.profileSection = page.locator('section, div').filter({ hasText: /Profile Information/i }).first();
    this.passwordSection = page.locator('section, div').filter({ hasText: /Change Password/i }).first();
    this.deleteSection = page.locator('section, div').filter({ hasText: /Delete Account/i }).first();

    // Profile form inputs
    this.nameInput = page.locator('input[name="name"]').or(
      page.getByLabel(/Full Name|Name/i)
    );
    this.emailInput = page.locator('input[name="email"]').or(
      page.getByLabel(/Email/i)
    );
    this.phoneInput = page.locator('input[name="phone"]').or(
      page.getByLabel(/Phone/i)
    );

    // Avatar
    this.avatarUpload = page.locator('input[type="file"]').first();
    this.avatarPreview = page.locator('img[alt*="avatar" i], img[alt*="profile" i]').or(
      page.locator('.rounded-full img')
    );
    this.removeAvatarButton = page.getByRole('button', { name: /Remove|Delete/i }).filter({
      has: page.locator('svg'),
    }).first();

    // Profile save
    this.saveButton = page.getByRole('button', { name: /Save|Update Profile/i });
    this.successMessage = page.locator('.bg-green-50, [role="alert"]').filter({ hasText: /success|updated/i });
    this.errorMessage = page.locator('.bg-red-50, [role="alert"]').filter({ hasText: /error|failed/i });

    // Password change form
    this.currentPasswordInput = page.locator('input[name="currentPassword"]').or(
      page.getByLabel(/Current Password/i)
    );
    this.newPasswordInput = page.locator('input[name="newPassword"]').or(
      page.getByLabel(/New Password/i)
    );
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]').or(
      page.getByLabel(/Confirm.*Password/i)
    );
    this.changePasswordButton = page.getByRole('button', { name: /Change Password|Update Password/i });
    this.passwordSuccessMessage = page.locator('.bg-green-50, [role="alert"]').filter({ hasText: /password.*changed|password.*updated/i });
    this.passwordErrorMessage = page.locator('.bg-red-50, [role="alert"]');

    // Delete account
    this.deleteAccountButton = page.getByRole('button', { name: /Delete.*Account/i });
    this.deleteModal = page.locator('.fixed.inset-0, [role="dialog"]');
    this.deleteConfirmInput = this.deleteModal.locator('input[type="text"]').or(
      page.getByPlaceholder(/DELETE|type.*delete/i)
    );
    this.confirmDeleteButton = this.deleteModal.getByRole('button', { name: /Delete|Confirm/i }).last();
    this.cancelDeleteButton = this.deleteModal.getByRole('button', { name: /Cancel/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoSettings(): Promise<void> {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async updateProfile(data: { name?: string; phone?: string }): Promise<void> {
    if (data.name) {
      await this.nameInput.clear();
      await this.nameInput.fill(data.name);
    }
    if (data.phone) {
      await this.phoneInput.clear();
      await this.phoneInput.fill(data.phone);
    }
    await this.saveButton.click();
  }

  async uploadAvatar(filePath: string): Promise<void> {
    await this.avatarUpload.setInputFiles(filePath);
  }

  async removeAvatar(): Promise<void> {
    await this.removeAvatarButton.click();
  }

  async changePassword(current: string, newPass: string, confirm: string): Promise<void> {
    await this.currentPasswordInput.fill(current);
    await this.newPasswordInput.fill(newPass);
    await this.confirmPasswordInput.fill(confirm);
    await this.changePasswordButton.click();
  }

  async deleteAccount(confirmText: string): Promise<void> {
    await this.deleteAccountButton.click();
    await expect(this.deleteModal).toBeVisible();
    await this.deleteConfirmInput.fill(confirmText);
    await this.confirmDeleteButton.click();
  }

  async cancelAccountDeletion(): Promise<void> {
    await this.cancelDeleteButton.click();
    await expect(this.deleteModal).not.toBeVisible();
  }

  async expectProfileUpdated(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async expectPasswordChanged(): Promise<void> {
    await expect(this.passwordSuccessMessage).toBeVisible({ timeout: 10000 });
  }

  async expectValidationError(message: string): Promise<void> {
    const error = this.page.locator('.text-red-500, .text-red-600, [role="alert"]').filter({ hasText: message });
    await expect(error).toBeVisible({ timeout: 5000 });
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage.filter({ hasText: message })).toBeVisible({ timeout: 5000 });
  }

  async getCurrentName(): Promise<string> {
    return await this.nameInput.inputValue();
  }

  async getCurrentEmail(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  async getCurrentPhone(): Promise<string> {
    return await this.phoneInput.inputValue();
  }

  async isAvatarVisible(): Promise<boolean> {
    return await this.avatarPreview.isVisible();
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.nameInput).toBeVisible({ timeout: 10000 });
  }
}
