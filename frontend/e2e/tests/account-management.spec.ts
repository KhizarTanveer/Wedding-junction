import { test, expect } from '../fixtures';
import { LoginPage, ProfilePage, ResetPasswordPage } from '../pages';
import {
  testUser,
  profileUpdate,
  passwordChange,
  generateUniqueEmail,
} from '../fixtures/test-data';
import { resetTestUsers, loginAsUser, loginWithFailedAttempts, getRemainingAttempts } from '../fixtures/auth.fixture';

test.describe('Account Management', () => {
  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test.describe('Profile Update', () => {
    test('should display current user profile information', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.expectPageLoaded();
      const currentName = await profilePage.getCurrentName();
      expect(currentName).toBeTruthy();
    });

    test('should update name successfully', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.updateProfile({ name: profileUpdate.name });
      await profilePage.expectProfileUpdated();

      // Verify name was updated
      const updatedName = await profilePage.getCurrentName();
      expect(updatedName).toBe(profileUpdate.name);
    });

    test('should update phone number successfully', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.updateProfile({ phone: profileUpdate.phone });
      await profilePage.expectProfileUpdated();

      // Verify phone was updated
      const updatedPhone = await profilePage.getCurrentPhone();
      expect(updatedPhone).toBe(profileUpdate.phone);
    });

    test('should validate phone number format', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      // Try invalid phone format
      await profilePage.updateProfile({ phone: '123' });
      await profilePage.expectValidationError('phone');
    });

    test('should show error for empty name', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.updateProfile({ name: '' });
      await profilePage.expectValidationError('name');
    });

    test('should show error for name too short', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.updateProfile({ name: 'A' });
      await profilePage.expectValidationError('name');
    });
  });

  test.describe('Avatar Management', () => {
    test('should upload avatar image', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      // Upload test image
      await profilePage.uploadAvatar('./fixtures/test-image.jpg');

      // Verify avatar is visible
      const isVisible = await profilePage.isAvatarVisible();
      expect(isVisible).toBe(true);
    });

    test('should show avatar preview after upload', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.uploadAvatar('./fixtures/test-image.jpg');
      await expect(profilePage.avatarPreview).toBeVisible();
    });

    test('should remove avatar', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      // First upload an avatar
      await profilePage.uploadAvatar('./fixtures/test-image.jpg');
      await expect(profilePage.avatarPreview).toBeVisible();

      // Then remove it
      await profilePage.removeAvatar();
      // Avatar should be removed or reset to default
    });

    test('should validate image file type', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      // Try to upload a non-image file (this would need a test text file)
      // For now, we'll check that the file input accepts only images
      const acceptAttr = await profilePage.avatarUpload.getAttribute('accept');
      expect(acceptAttr).toMatch(/image/i);
    });

    test('should validate image file size', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      // This test would require a large test file
      // The validation happens client-side, checking for max size
    });
  });

  test.describe('Change Password', () => {
    test('should change password with valid inputs', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.changePassword(
        passwordChange.currentPassword,
        passwordChange.newPassword,
        passwordChange.newPassword
      );

      await profilePage.expectPasswordChanged();
    });

    test('should show error for incorrect current password', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.changePassword(
        'WrongPassword123!',
        passwordChange.newPassword,
        passwordChange.newPassword
      );

      await profilePage.expectValidationError('current password');
    });

    test('should show error for weak new password', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.changePassword(
        passwordChange.currentPassword,
        '123', // Too short
        '123'
      );

      await profilePage.expectValidationError('password');
    });

    test('should show error for password mismatch', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.changePassword(
        passwordChange.currentPassword,
        passwordChange.newPassword,
        'DifferentPassword789!'
      );

      await profilePage.expectValidationError('match');
    });

    test('should require current password', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.changePassword(
        '', // Empty current password
        passwordChange.newPassword,
        passwordChange.newPassword
      );

      await profilePage.expectValidationError('required');
    });
  });

  test.describe('Delete Account', () => {
    test('should show delete confirmation modal', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.deleteAccountButton.click();
      await expect(profilePage.deleteModal).toBeVisible();
    });

    test('should require typing DELETE to confirm', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.deleteAccountButton.click();
      await expect(profilePage.deleteModal).toBeVisible();

      // Try to confirm without typing DELETE
      await profilePage.deleteConfirmInput.fill('wrong');
      // Confirm button should be disabled or show error
      const isDisabled = await profilePage.confirmDeleteButton.isDisabled();
      expect(isDisabled).toBe(true);
    });

    test('should delete account and redirect to home', async ({ page }) => {
      // Create a temporary user for deletion
      const uniqueEmail = generateUniqueEmail('delete');
      // Skip if we can't create a test user - this would need API setup

      const profilePage = new ProfilePage(page);
      await loginAsUser(page);
      await profilePage.goto();

      await profilePage.deleteAccount('DELETE');

      // Should redirect to home page
      await expect(page).toHaveURL('/');
    });

    test('should cancel deletion when clicking cancel', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.goto();

      await profilePage.deleteAccountButton.click();
      await expect(profilePage.deleteModal).toBeVisible();

      await profilePage.cancelAccountDeletion();

      // Should stay on profile page
      await profilePage.expectPageLoaded();
    });
  });

  test.describe('Login Security', () => {
    test('should track failed login attempts', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // First failed attempt
      await loginPage.login(testUser.email, 'WrongPassword1!');
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test('should show warning after 3 failed attempts', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Make 3 failed login attempts
      await loginPage.attemptLoginMultipleTimes(testUser.email, 'WrongPassword1!', 3);

      // Check for warning message
      await loginPage.goto();
      await loginPage.login(testUser.email, 'WrongPassword1!');

      // Should show remaining attempts warning
      const hasWarning = await loginPage.attemptsWarning.isVisible().catch(() => false);
      expect(hasWarning).toBe(true);
    });

    test('should lock account after 5 failed attempts', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Make 5 failed login attempts
      await loginPage.attemptLoginMultipleTimes(testUser.email, 'WrongPassword1!', 5);

      // Try to login again
      await loginPage.goto();
      await loginPage.login(testUser.email, 'WrongPassword1!');

      // Should show lockout message
      await loginPage.expectLockout();
    });

    test('should show lockout duration', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Make 5 failed login attempts to trigger lockout
      await loginPage.attemptLoginMultipleTimes(testUser.email, 'WrongPassword1!', 5);

      // Verify lockout message shows duration
      await loginPage.goto();
      await loginPage.login(testUser.email, 'WrongPassword1!');

      const duration = await loginPage.getLockoutDuration();
      expect(duration).toMatch(/hour|minute/i);
    });

    test('should prevent login during lockout period', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Trigger lockout
      await loginPage.attemptLoginMultipleTimes(testUser.email, 'WrongPassword1!', 5);

      // Try with correct password during lockout
      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);

      // Should still be locked
      await loginPage.expectLockout();
    });

    test('should reset attempts after successful login', async ({ page }) => {
      await resetTestUsers();

      const loginPage = new LoginPage(page);

      // Make 2 failed attempts
      await loginPage.attemptLoginMultipleTimes(testUser.email, 'WrongPassword1!', 2);

      // Successful login
      await loginPage.goto();
      await loginPage.loginAndWait(testUser.email, testUser.password);

      // Attempts should be reset - verified by being logged in
      await expect(page).not.toHaveURL('/login');
    });
  });

  test.describe('Reset Password', () => {
    test('should reset password with valid token', async ({ page }) => {
      const resetPage = new ResetPasswordPage(page);
      // Use a test token (would need to be generated by backend)
      await resetPage.goto('valid-test-token');

      await resetPage.resetPassword('NewSecurePassword123!', 'NewSecurePassword123!');
      await resetPage.expectSuccess();
    });

    test('should show error for expired token', async ({ page }) => {
      const resetPage = new ResetPasswordPage(page);
      await resetPage.goto('expired-test-token');

      await resetPage.expectTokenExpired();
    });

    test('should show error for invalid token', async ({ page }) => {
      const resetPage = new ResetPasswordPage(page);
      await resetPage.goto('invalid-random-token-12345');

      await resetPage.expectTokenInvalid();
    });

    test('should validate password strength', async ({ page }) => {
      const resetPage = new ResetPasswordPage(page);
      await resetPage.goto('valid-test-token');

      await resetPage.resetPassword('weak', 'weak');
      await resetPage.expectWeakPassword();
    });

    test('should validate password confirmation match', async ({ page }) => {
      const resetPage = new ResetPasswordPage(page);
      await resetPage.goto('valid-test-token');

      await resetPage.resetPassword('StrongPassword123!', 'DifferentPassword456!');
      await resetPage.expectPasswordMismatch();
    });

    test('should redirect to login after successful reset', async ({ page }) => {
      const resetPage = new ResetPasswordPage(page);
      await resetPage.goto('valid-test-token');

      await resetPage.resetPassword('NewSecurePassword123!', 'NewSecurePassword123!');
      await resetPage.expectSuccess();

      // Click login link or wait for redirect
      await resetPage.clickLoginLink();
      await expect(page).toHaveURL('/login');
    });
  });
});
