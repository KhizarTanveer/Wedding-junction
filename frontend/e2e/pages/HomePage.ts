import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly searchBar: Locator;
  readonly searchButton: Locator;
  readonly heroSection: Locator;
  readonly categoriesSection: Locator;
  readonly featuredVendorsSection: Locator;
  readonly navbar: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBar = page.getByPlaceholder(/search/i);
    this.searchButton = page.getByRole('button', { name: /search/i });
    this.heroSection = page.locator('section').first();
    // Categories section contains "Wedding Categories" heading
    this.categoriesSection = page.locator('section').filter({ hasText: /Wedding Categories/i });
    // Featured vendors section contains "Featured Vendors" heading
    this.featuredVendorsSection = page.locator('section#featured, section').filter({ hasText: /Featured Vendors/i });
    this.navbar = page.locator('nav');
    this.loginLink = page.getByRole('link', { name: /login|sign in/i });
    this.signupLink = page.getByRole('link', { name: /sign up|register/i });
    // User menu is typically accessed via button with user icon or name
    this.userMenu = page.locator('button').filter({ hasText: /account|profile/i }).or(page.locator('nav button').last());
    this.logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async searchVendors(query: string): Promise<void> {
    await this.searchBar.fill(query);
    await this.searchButton.click();
  }

  async clickCategory(categoryName: string): Promise<void> {
    await this.page.getByRole('link', { name: categoryName }).first().click();
  }

  async clickFeaturedVendor(index: number = 0): Promise<void> {
    // Featured vendor cards have "Explore Vendor" buttons
    const exploreButtons = this.page.getByRole('button', { name: /Explore Vendor/i });
    await exploreButtons.nth(index).click();
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.page.evaluate(() => localStorage.getItem('token'));
    return token !== null;
  }

  async getLoggedInUser(): Promise<any | null> {
    const userStr = await this.page.evaluate(() => localStorage.getItem('currentUser'));
    return userStr ? JSON.parse(userStr) : null;
  }

  async clickLogin(): Promise<void> {
    await this.loginLink.click();
    await expect(this.page).toHaveURL('/login');
  }

  async clickSignup(): Promise<void> {
    await this.signupLink.click();
    await expect(this.page).toHaveURL('/signup');
  }

  async logout(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    });
    await this.page.reload();
  }

  async getCategories(): Promise<string[]> {
    // Categories have h3 elements with category names
    const categoryHeadings = this.categoriesSection.locator('h3');
    const count = await categoryHeadings.count();
    const categories: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await categoryHeadings.nth(i).textContent();
      if (text) categories.push(text.trim());
    }
    return categories;
  }

  async getFeaturedVendors(): Promise<string[]> {
    // Featured vendors have h3 elements with vendor names
    const vendorHeadings = this.featuredVendorsSection.locator('h3');
    const count = await vendorHeadings.count();
    const vendors: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await vendorHeadings.nth(i).textContent();
      if (text) vendors.push(text.trim());
    }
    return vendors;
  }

  async navigateToCategory(categoryName: string): Promise<void> {
    // Click "Explore" or "Learn More" button for category
    const categoryCard = this.categoriesSection.locator('div').filter({ hasText: categoryName }).first();
    await categoryCard.getByRole('button', { name: /Explore/i }).click();
  }

  async navigateToVendor(vendorName: string): Promise<void> {
    // Click "Explore Vendor" button for specific vendor
    const vendorCard = this.featuredVendorsSection.locator('div').filter({ hasText: vendorName }).first();
    await vendorCard.getByRole('button', { name: /Explore Vendor/i }).click();
  }

  async expectToBeOnHomePage(): Promise<void> {
    await expect(this.page).toHaveURL('/');
  }
}
