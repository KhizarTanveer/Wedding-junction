import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { testVendor, generateUniqueEmail, generateUniquePhone } from '../fixtures/test-data';
import { isLoggedIn, resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Vendor Registration', () => {
  // Reset test users before all tests to clear any account locks
  test.beforeAll(async () => {
    await resetTestUsers();
  });
  test('should complete multi-step vendor application', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    const uniqueEmail = generateUniqueEmail('vendor');
    const uniquePhone = generateUniquePhone();

    // Step 0: Account info
    await signupPage.selectVendorType();
    await signupPage.nameInput.fill(testVendor.name);
    await signupPage.emailInput.fill(uniqueEmail);
    await signupPage.passwordInput.fill(testVendor.password);
    await signupPage.confirmPasswordInput.fill(testVendor.password);
    await signupPage.clickContinue();

    // Should move to step 1
    await expect(page.getByText('Business Information')).toBeVisible();

    // Step 1: Business Info
    await signupPage.fillBusinessInfo(
      testVendor.businessInfo.name,
      testVendor.businessInfo.description
    );
    await signupPage.clickContinue();

    // Should move to step 2
    await expect(page.getByText('Service Details')).toBeVisible();

    // Step 2: Services
    await signupPage.fillServiceDetails(
      testVendor.serviceDetails.category,
      testVendor.serviceDetails.experience,
      testVendor.serviceDetails.servicesOffered,
      testVendor.serviceDetails.pricing.minPrice,
      testVendor.serviceDetails.pricing.maxPrice
    );
    await signupPage.clickContinue();

    // Should move to step 3
    await expect(page.getByText('Contact Information')).toBeVisible();

    // Step 3: Contact
    await signupPage.fillContactInfo(
      uniquePhone,
      testVendor.contact.email,
      testVendor.contact.website,
      testVendor.contact.socialMedia.instagram
    );
    await signupPage.clickContinue();

    // Should move to step 4
    await expect(page.getByText('Location')).toBeVisible();

    // Step 4: Location
    await signupPage.fillLocationInfo(
      testVendor.location.city,
      testVendor.location.state,
      testVendor.location.serviceAreas
    );
    await signupPage.clickContinue();

    // Should move to step 5 (Review)
    await expect(page.getByText('Review Your Application')).toBeVisible();

    // Step 5: Review & Submit
    await signupPage.submitVendorApplication();

    // Should redirect to become-vendor page showing application status
    await expect(page).toHaveURL('/become-vendor');

    // Should be logged in
    expect(await isLoggedIn(page)).toBe(true);
  });

  test('should save progress between steps', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    // Fill step 0
    await signupPage.selectVendorType();
    await signupPage.nameInput.fill(testVendor.name);
    await signupPage.emailInput.fill(generateUniqueEmail('vendor'));
    await signupPage.passwordInput.fill(testVendor.password);
    await signupPage.confirmPasswordInput.fill(testVendor.password);
    await signupPage.clickContinue();

    // Fill step 1
    await signupPage.fillBusinessInfo(
      testVendor.businessInfo.name,
      testVendor.businessInfo.description
    );
    await signupPage.clickContinue();

    // Go back to step 1
    await signupPage.clickPrevious();

    // Data should still be there
    await expect(signupPage.businessNameInput).toHaveValue(testVendor.businessInfo.name);
    await expect(signupPage.businessDescriptionInput).toHaveValue(testVendor.businessInfo.description);
  });

  test('should navigate back to previous steps', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    // Complete first few steps
    await signupPage.selectVendorType();
    await signupPage.nameInput.fill(testVendor.name);
    await signupPage.emailInput.fill(generateUniqueEmail('vendor'));
    await signupPage.passwordInput.fill(testVendor.password);
    await signupPage.confirmPasswordInput.fill(testVendor.password);
    await signupPage.clickContinue();

    // Should be on step 1
    await expect(page.getByText('Business Information')).toBeVisible();

    await signupPage.fillBusinessInfo(
      testVendor.businessInfo.name,
      testVendor.businessInfo.description
    );
    await signupPage.clickContinue();

    // Should be on step 2
    await expect(page.getByText('Service Details')).toBeVisible();

    // Go back
    await signupPage.clickPrevious();

    // Should be on step 1
    await expect(page.getByText('Business Information')).toBeVisible();

    // Go back again
    await signupPage.clickPrevious();

    // Should be on step 0
    await expect(signupPage.userTypeButton).toBeVisible();
  });

  test.describe('Validation Errors', () => {
    test('should show error for short business description', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      // Complete step 0
      await signupPage.selectVendorType();
      await signupPage.nameInput.fill(testVendor.name);
      await signupPage.emailInput.fill(generateUniqueEmail('vendor'));
      await signupPage.passwordInput.fill(testVendor.password);
      await signupPage.confirmPasswordInput.fill(testVendor.password);
      await signupPage.clickContinue();

      // Step 1: Business Info with short description
      await signupPage.businessNameInput.fill('Test Business');
      await signupPage.businessDescriptionInput.fill('Too short');
      await signupPage.clickContinue();

      // Should show error
      await signupPage.expectErrorMessage('at least 50 characters');
    });

    test('should show error for missing service category', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      // Complete steps 0-1
      await signupPage.selectVendorType();
      await signupPage.nameInput.fill(testVendor.name);
      await signupPage.emailInput.fill(generateUniqueEmail('vendor'));
      await signupPage.passwordInput.fill(testVendor.password);
      await signupPage.confirmPasswordInput.fill(testVendor.password);
      await signupPage.clickContinue();

      await signupPage.fillBusinessInfo(
        testVendor.businessInfo.name,
        testVendor.businessInfo.description
      );
      await signupPage.clickContinue();

      // Step 2: Don't select category
      await signupPage.experienceInput.fill('5');
      await page.getByLabel(testVendor.serviceDetails.servicesOffered[0]).check();
      await signupPage.minPriceInput.fill('50000');
      await signupPage.maxPriceInput.fill('200000');
      await signupPage.clickContinue();

      // Should show error
      await signupPage.expectErrorMessage('select a service category');
    });

    test('should show error for invalid price range', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      // Complete steps 0-1
      await signupPage.selectVendorType();
      await signupPage.nameInput.fill(testVendor.name);
      await signupPage.emailInput.fill(generateUniqueEmail('vendor'));
      await signupPage.passwordInput.fill(testVendor.password);
      await signupPage.confirmPasswordInput.fill(testVendor.password);
      await signupPage.clickContinue();

      await signupPage.fillBusinessInfo(
        testVendor.businessInfo.name,
        testVendor.businessInfo.description
      );
      await signupPage.clickContinue();

      // Step 2: Min price greater than max
      await signupPage.serviceCategorySelect.selectOption({ index: 1 });
      await signupPage.experienceInput.fill('5');
      await page.getByLabel(testVendor.serviceDetails.servicesOffered[0]).check();
      await signupPage.minPriceInput.fill('200000');
      await signupPage.maxPriceInput.fill('50000'); // Less than min
      await signupPage.clickContinue();

      // Should show error
      await signupPage.expectErrorMessage('cannot be greater');
    });

    test('should show error for missing contact phone', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      // Complete steps 0-2
      await signupPage.selectVendorType();
      await signupPage.nameInput.fill(testVendor.name);
      await signupPage.emailInput.fill(generateUniqueEmail('vendor'));
      await signupPage.passwordInput.fill(testVendor.password);
      await signupPage.confirmPasswordInput.fill(testVendor.password);
      await signupPage.clickContinue();

      await signupPage.fillBusinessInfo(
        testVendor.businessInfo.name,
        testVendor.businessInfo.description
      );
      await signupPage.clickContinue();

      await signupPage.fillServiceDetails(
        testVendor.serviceDetails.category,
        testVendor.serviceDetails.experience,
        testVendor.serviceDetails.servicesOffered,
        testVendor.serviceDetails.pricing.minPrice,
        testVendor.serviceDetails.pricing.maxPrice
      );
      await signupPage.clickContinue();

      // Step 3: Don't fill phone
      await signupPage.contactEmailInput.fill('contact@test.com');
      await signupPage.clickContinue();

      // Should show error
      await signupPage.expectErrorMessage('phone is required');
    });

    test('should show error for terms not accepted', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      const uniqueEmail = generateUniqueEmail('vendor');
      const uniquePhone = generateUniquePhone();

      // Complete all steps until review
      await signupPage.selectVendorType();
      await signupPage.nameInput.fill(testVendor.name);
      await signupPage.emailInput.fill(uniqueEmail);
      await signupPage.passwordInput.fill(testVendor.password);
      await signupPage.confirmPasswordInput.fill(testVendor.password);
      await signupPage.clickContinue();

      await signupPage.fillBusinessInfo(
        testVendor.businessInfo.name,
        testVendor.businessInfo.description
      );
      await signupPage.clickContinue();

      await signupPage.fillServiceDetails(
        testVendor.serviceDetails.category,
        testVendor.serviceDetails.experience,
        testVendor.serviceDetails.servicesOffered,
        testVendor.serviceDetails.pricing.minPrice,
        testVendor.serviceDetails.pricing.maxPrice
      );
      await signupPage.clickContinue();

      await signupPage.fillContactInfo(
        uniquePhone,
        testVendor.contact.email
      );
      await signupPage.clickContinue();

      await signupPage.fillLocationInfo(
        testVendor.location.city,
        testVendor.location.state
      );
      await signupPage.clickContinue();

      // Step 5: Don't accept terms, try to submit
      await signupPage.submitApplicationButton.click();

      // Should show error
      await signupPage.expectErrorMessage('must accept the terms');
    });
  });

  test('should show application status after submission', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    const uniqueEmail = generateUniqueEmail('vendor');
    const uniquePhone = generateUniquePhone();

    // Complete full registration
    await signupPage.selectVendorType();
    await signupPage.nameInput.fill(testVendor.name);
    await signupPage.emailInput.fill(uniqueEmail);
    await signupPage.passwordInput.fill(testVendor.password);
    await signupPage.confirmPasswordInput.fill(testVendor.password);
    await signupPage.clickContinue();

    await signupPage.fillBusinessInfo(
      testVendor.businessInfo.name,
      testVendor.businessInfo.description
    );
    await signupPage.clickContinue();

    await signupPage.fillServiceDetails(
      testVendor.serviceDetails.category,
      testVendor.serviceDetails.experience,
      testVendor.serviceDetails.servicesOffered,
      testVendor.serviceDetails.pricing.minPrice,
      testVendor.serviceDetails.pricing.maxPrice
    );
    await signupPage.clickContinue();

    await signupPage.fillContactInfo(
      uniquePhone,
      testVendor.contact.email
    );
    await signupPage.clickContinue();

    await signupPage.fillLocationInfo(
      testVendor.location.city,
      testVendor.location.state
    );
    await signupPage.clickContinue();

    await signupPage.submitVendorApplication();

    // Should show application status page
    await expect(page).toHaveURL('/become-vendor');

    // Should show pending status or confirmation
    await expect(page.locator('text=/pending|submitted|review|waiting/i')).toBeVisible();
  });
});
