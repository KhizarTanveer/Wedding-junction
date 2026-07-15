import { Page, Locator, expect } from '@playwright/test';

export class VendorPage {
  readonly page: Page;
  readonly vendorName: Locator;
  readonly vendorDescription: Locator;
  readonly vendorRating: Locator;
  readonly vendorLocation: Locator;
  readonly vendorPricing: Locator;
  readonly bookNowButton: Locator;
  readonly chatButton: Locator;
  readonly reviewsSection: Locator;
  readonly gallerySection: Locator;
  readonly contactSection: Locator;
  readonly servicesSection: Locator;

  constructor(page: Page) {
    this.page = page;
    // Vendor name is in h1 element
    this.vendorName = page.locator('h1').first();
    // Description is in a p element with stone color classes
    this.vendorDescription = page.locator('p.text-stone-600').first();
    // Rating is displayed with stars and text like "(4.0)" or "(X reviews)"
    this.vendorRating = page.locator('span').filter({ hasText: /\(\d+(\.\d+)?\s*(reviews?)?\)/i }).first();
    // Location is shown in the overlay or in p elements with city/state
    this.vendorLocation = page.locator('p').filter({ hasText: /,\s*\w+/i }).first();
    // Price is shown with "Rs." prefix
    this.vendorPricing = page.locator('p').filter({ hasText: /Rs\./ }).first();
    // Book Now button
    this.bookNowButton = page.getByRole('button', { name: /Book Now/i });
    // Send Message link (not button in VendorDetail)
    this.chatButton = page.getByRole('link', { name: /Send Message/i }).or(
      page.getByRole('button', { name: /chat|message/i })
    );
    // Tab-based sections in VendorDetail
    this.reviewsSection = page.getByRole('button', { name: /Reviews/i }).or(
      page.locator('section').filter({ hasText: /reviews/i })
    );
    this.gallerySection = page.locator('section').filter({ hasText: /gallery|photos/i });
    this.contactSection = page.locator('div').filter({ hasText: /Contact Information/i });
    this.servicesSection = page.locator('div').filter({ hasText: /Services Offered/i });
  }

  async goto(vendorId: string): Promise<void> {
    await this.page.goto(`/vendors/${vendorId}`);
  }

  async gotoExploreVendor(vendorId: string): Promise<void> {
    await this.page.goto(`/explorevendor/${vendorId}`);
  }

  async getVendorName(): Promise<string> {
    return (await this.vendorName.textContent()) || '';
  }

  async getVendorDescription(): Promise<string> {
    return (await this.vendorDescription.textContent()) || '';
  }

  async clickBookNow(): Promise<void> {
    await this.bookNowButton.click();
  }

  async clickChat(): Promise<void> {
    await this.chatButton.click();
  }

  async getVendorDetails(): Promise<{
    name: string;
    description: string;
    rating: string;
    location: string;
  }> {
    // Wait for content to load
    await this.page.waitForLoadState('networkidle');

    const name = await this.getVendorName();
    const description = await this.getVendorDescription();

    // Get rating text - could be "(4.0)" or "(5 reviews)"
    let rating = '';
    try {
      rating = (await this.vendorRating.textContent({ timeout: 5000 })) || '';
    } catch {
      rating = '';
    }

    // Get location text
    let location = '';
    try {
      location = (await this.vendorLocation.textContent({ timeout: 5000 })) || '';
    } catch {
      location = '';
    }

    return { name, description, rating, location };
  }

  async getReviewsCount(): Promise<number> {
    // Reviews count is in the tab button like "Reviews (5)"
    const reviewsTab = this.page.getByRole('button', { name: /Reviews\s*\(\d+\)/i });
    try {
      const text = await reviewsTab.textContent({ timeout: 5000 });
      const match = text?.match(/\((\d+)\)/);
      return match ? parseInt(match[1]) : 0;
    } catch {
      return 0;
    }
  }

  async getGalleryImages(): Promise<number> {
    const images = this.gallerySection.locator('img');
    return await images.count();
  }

  async getServices(): Promise<string[]> {
    // Services are listed in h4 elements or li elements
    const serviceItems = this.servicesSection.locator('h4, li');
    const count = await serviceItems.count();
    const services: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await serviceItems.nth(i).textContent();
      if (text) services.push(text.trim());
    }
    return services;
  }

  async expectVendorPageLoaded(): Promise<void> {
    await expect(this.vendorName).toBeVisible({ timeout: 10000 });
  }

  async expectBookButtonVisible(): Promise<void> {
    await expect(this.bookNowButton).toBeVisible({ timeout: 10000 });
  }

  async scrollToReviews(): Promise<void> {
    // Click reviews tab instead of scrolling
    const reviewsTab = this.page.getByRole('button', { name: /Reviews/i });
    if (await reviewsTab.isVisible()) {
      await reviewsTab.click();
    } else {
      await this.reviewsSection.scrollIntoViewIfNeeded();
    }
  }

  async scrollToGallery(): Promise<void> {
    await this.gallerySection.scrollIntoViewIfNeeded();
  }

  async clickAboutTab(): Promise<void> {
    await this.page.getByRole('button', { name: /About/i }).click();
  }

  async clickServicesTab(): Promise<void> {
    await this.page.getByRole('button', { name: /Services/i }).click();
  }

  async clickReviewsTab(): Promise<void> {
    await this.page.getByRole('button', { name: /Reviews/i }).click();
  }
}
