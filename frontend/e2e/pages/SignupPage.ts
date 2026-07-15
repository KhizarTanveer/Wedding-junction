import { Page, Locator, expect } from '@playwright/test';

export class SignupPage {
  readonly page: Page;
  readonly userTypeButton: Locator;
  readonly vendorTypeButton: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly continueButton: Locator;
  readonly createAccountButton: Locator;
  readonly signInLink: Locator;
  readonly errorMessage: Locator;

  // Vendor form fields
  readonly businessNameInput: Locator;
  readonly businessDescriptionInput: Locator;
  readonly serviceCategorySelect: Locator;
  readonly experienceInput: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly contactEmailInput: Locator;
  readonly websiteInput: Locator;
  readonly instagramInput: Locator;
  readonly facebookInput: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly serviceAreasInput: Locator;
  readonly vendorTermsCheckbox: Locator;
  readonly submitApplicationButton: Locator;
  readonly previousButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userTypeButton = page.getByRole('button', { name: /User.*Browse & book vendors/i });
    this.vendorTypeButton = page.getByRole('button', { name: /Vendor.*Offer wedding services/i });
    this.nameInput = page.getByPlaceholder('Your full name');
    this.emailInput = page.getByPlaceholder('you@example.com');
    this.passwordInput = page.getByPlaceholder('Create a password');
    this.confirmPasswordInput = page.getByPlaceholder('Confirm your password');
    this.termsCheckbox = page.locator('form input[type="checkbox"]').first();
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.createAccountButton = page.getByRole('button', { name: 'Create Account' });
    // Be specific - target the Sign In link in the footer section, not the navbar
    this.signInLink = page.locator('p').filter({ hasText: /Already have an account/ }).getByRole('link', { name: 'Sign In' });
    this.errorMessage = page.locator('.bg-red-50');

    // Vendor form fields
    this.businessNameInput = page.getByPlaceholder('Your business or brand name');
    this.businessDescriptionInput = page.getByPlaceholder(/Tell us about your services/);
    this.serviceCategorySelect = page.locator('select[name="serviceCategory"]');
    this.experienceInput = page.locator('input[name="experience"]');
    this.minPriceInput = page.locator('input[name="minPrice"]');
    this.maxPriceInput = page.locator('input[name="maxPrice"]');
    this.contactPhoneInput = page.getByPlaceholder('10-digit mobile number');
    this.contactEmailInput = page.getByPlaceholder('business@example.com');
    this.websiteInput = page.getByPlaceholder('https://yourwebsite.com');
    this.instagramInput = page.getByPlaceholder('@yourusername');
    this.facebookInput = page.getByPlaceholder('facebook.com/yourpage');
    this.cityInput = page.getByPlaceholder('e.g., Lahore');
    this.stateSelect = page.locator('select[name="state"]');
    this.serviceAreasInput = page.getByPlaceholder(/comma separated/);
    this.vendorTermsCheckbox = page.locator('#termsAccepted');
    this.submitApplicationButton = page.getByRole('button', { name: 'Submit Application' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/signup');
  }

  async selectUserType(): Promise<void> {
    await this.userTypeButton.click();
  }

  async selectVendorType(): Promise<void> {
    await this.vendorTypeButton.click();
  }

  async fillUserForm(userData: { name: string; email: string; password: string }): Promise<void> {
    await this.nameInput.fill(userData.name);
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.password);
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }

  async submitUserSignup(): Promise<void> {
    await this.acceptTerms();
    await this.createAccountButton.click();
  }

  async signupUser(userData: { name: string; email: string; password: string }): Promise<void> {
    await this.selectUserType();
    await this.fillUserForm(userData);
    await this.submitUserSignup();
    await expect(this.page).toHaveURL('/');
  }

  // Vendor signup methods
  async fillBusinessInfo(businessName: string, description: string): Promise<void> {
    await this.businessNameInput.fill(businessName);
    await this.businessDescriptionInput.fill(description);
  }

  async fillServiceDetails(
    category: string,
    experience: number,
    services: string[],
    minPrice: number,
    maxPrice: number
  ): Promise<void> {
    await this.serviceCategorySelect.selectOption({ label: category });
    await this.experienceInput.fill(experience.toString());

    for (const service of services) {
      await this.page.getByLabel(service).check();
    }

    await this.minPriceInput.fill(minPrice.toString());
    await this.maxPriceInput.fill(maxPrice.toString());
  }

  async fillContactInfo(
    phone: string,
    email: string,
    website?: string,
    instagram?: string,
    facebook?: string
  ): Promise<void> {
    await this.contactPhoneInput.fill(phone);
    await this.contactEmailInput.fill(email);
    if (website) await this.websiteInput.fill(website);
    if (instagram) await this.instagramInput.fill(instagram);
    if (facebook) await this.facebookInput.fill(facebook);
  }

  async fillLocationInfo(city: string, state: string, serviceAreas?: string[]): Promise<void> {
    await this.cityInput.fill(city);
    await this.stateSelect.selectOption(state);
    if (serviceAreas) {
      await this.serviceAreasInput.fill(serviceAreas.join(', '));
    }
  }

  async acceptVendorTerms(): Promise<void> {
    await this.vendorTermsCheckbox.check();
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async clickPrevious(): Promise<void> {
    await this.previousButton.click();
  }

  async submitVendorApplication(acceptTerms: boolean = true): Promise<void> {
    if (acceptTerms) {
      await this.acceptVendorTerms();
    }
    await this.submitApplicationButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return (await this.errorMessage.textContent()) || '';
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async getCurrentStep(): Promise<number> {
    const stepText = await this.page.locator('.text-stone-500.text-sm').textContent();
    const match = stepText?.match(/Step (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}
