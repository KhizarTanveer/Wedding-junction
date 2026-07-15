import { Page, Locator, expect } from '@playwright/test';

export class VendorDashboardPage {
  readonly page: Page;
  readonly dashboardStats: Locator;
  readonly totalBookings: Locator;
  readonly pendingBookings: Locator;
  readonly totalEarnings: Locator;
  readonly averageRating: Locator;

  // Navigation
  readonly bookingsLink: Locator;
  readonly profileLink: Locator;
  readonly galleryLink: Locator;
  readonly reviewsLink: Locator;
  readonly messagesLink: Locator;

  // Bookings management
  readonly bookingsList: Locator;
  readonly bookingCards: Locator;
  readonly acceptBookingButton: Locator;
  readonly rejectBookingButton: Locator;
  readonly rejectReasonInput: Locator;
  readonly pendingTab: Locator;
  readonly confirmedTab: Locator;
  readonly completedTab: Locator;

  // Profile management
  readonly editProfileButton: Locator;
  readonly businessNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly saveProfileButton: Locator;

  // Gallery management
  readonly uploadButton: Locator;
  readonly galleryImages: Locator;
  readonly deleteImageButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Stats section - use the stat card structure
    this.dashboardStats = page.locator('section').first();

    // Stat cards - find by label text
    this.totalBookings = page.locator('div').filter({ hasText: /^Total Bookings$/i }).locator('p.text-3xl').first();
    this.pendingBookings = page.locator('div').filter({ hasText: /^Pending$/i }).locator('p.text-3xl').first();
    this.totalEarnings = page.locator('div').filter({ hasText: /Total Revenue/i }).locator('p.text-4xl, p.text-3xl').first();
    this.averageRating = page.locator('div').filter({ hasText: /Response Rate/i }).locator('span.text-2xl').first();

    // Navigation - Quick Actions section
    this.bookingsLink = page.getByRole('link', { name: /Manage Bookings/i }).or(
      page.locator('a[href="/vendor/bookings"]')
    );
    this.profileLink = page.getByRole('link', { name: /Edit Profile/i }).or(
      page.locator('a[href="/vendor/profile"]')
    );
    this.galleryLink = page.getByRole('link', { name: /gallery/i });
    this.reviewsLink = page.getByRole('link', { name: /reviews/i });
    this.messagesLink = page.getByRole('link', { name: /Messages/i }).or(
      page.locator('a[href="/chat"]')
    );

    // Bookings management - Recent Bookings table or card layout
    this.bookingsList = page.locator('table, .space-y-4').first();
    this.bookingCards = page.locator('div.bg-white.rounded-luxury-xl, table tbody tr');
    this.acceptBookingButton = page.getByRole('button', { name: /accept|confirm/i });
    this.rejectBookingButton = page.getByRole('button', { name: /reject|decline/i });
    this.rejectReasonInput = page.locator('textarea[name="rejectionReason"]');
    this.pendingTab = page.getByRole('tab', { name: /pending|requested|new requests/i }).or(
      page.getByRole('button', { name: /pending|requested|new requests|action required/i })
    );
    this.confirmedTab = page.getByRole('tab', { name: /confirmed/i }).or(
      page.getByRole('button', { name: /confirmed/i })
    );
    this.completedTab = page.getByRole('tab', { name: /completed/i }).or(
      page.getByRole('button', { name: /completed/i })
    );

    // Profile management
    this.editProfileButton = page.getByRole('button', { name: /edit/i });
    this.businessNameInput = page.locator('input[name="businessName"]');
    this.descriptionInput = page.locator('textarea[name="description"]');
    this.minPriceInput = page.locator('input[name="minPrice"]');
    this.maxPriceInput = page.locator('input[name="maxPrice"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.emailInput = page.locator('input[name="email"]');
    this.saveProfileButton = page.getByRole('button', { name: /save/i });

    // Gallery management
    this.uploadButton = page.getByRole('button', { name: /upload/i });
    this.galleryImages = page.locator('img').filter({ has: page.locator('[class*="gallery"]') });
    this.deleteImageButton = page.getByRole('button', { name: /delete/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/vendor');
  }

  async goToBookings(): Promise<void> {
    await this.bookingsLink.click();
    await expect(this.page).toHaveURL(/vendor\/bookings/);
  }

  async goToProfile(): Promise<void> {
    await this.profileLink.click();
    await expect(this.page).toHaveURL(/vendor\/profile/);
  }

  async goToMessages(): Promise<void> {
    await this.messagesLink.click();
    await expect(this.page).toHaveURL(/chat/);
  }

  async getStats(): Promise<{
    totalBookings: string;
    pendingBookings: string;
    totalEarnings: string;
    averageRating: string;
  }> {
    // Wait for dashboard to load
    await this.page.waitForLoadState('networkidle');

    let totalBookings = '';
    let pendingBookings = '';
    let totalEarnings = '';
    let averageRating = '';

    try {
      // Get Total Bookings from stat card
      const totalCard = this.page.locator('div').filter({ hasText: /Total Bookings/i }).first();
      totalBookings = (await totalCard.locator('p.text-3xl').first().textContent()) || '0';
    } catch {
      totalBookings = '0';
    }

    try {
      // Get Pending from stat card
      const pendingCard = this.page.locator('div').filter({ hasText: /^Pending$/i }).first();
      pendingBookings = (await pendingCard.locator('p.text-3xl').first().textContent()) || '0';
    } catch {
      pendingBookings = '0';
    }

    try {
      // Get Total Revenue
      const revenueSection = this.page.locator('div').filter({ hasText: /Total Revenue/i }).first();
      totalEarnings = (await revenueSection.locator('p.text-4xl').first().textContent()) || 'Rs. 0';
    } catch {
      totalEarnings = 'Rs. 0';
    }

    try {
      // Get Response Rate as a proxy for rating
      const metricCard = this.page.locator('div').filter({ hasText: /Response Rate/i }).first();
      averageRating = (await metricCard.locator('span').filter({ hasText: /\d+%/ }).first().textContent()) || '0%';
    } catch {
      averageRating = '0%';
    }

    return { totalBookings, pendingBookings, totalEarnings, averageRating };
  }

  // Bookings management methods
  async selectPendingBookings(): Promise<void> {
    await this.pendingTab.click();
  }

  async selectConfirmedBookings(): Promise<void> {
    await this.confirmedTab.click();
  }

  async selectCompletedBookings(): Promise<void> {
    await this.completedTab.click();
  }

  async getBookingsCount(): Promise<number> {
    return await this.bookingCards.count();
  }

  async acceptBooking(bookingIndex: number = 0): Promise<void> {
    const bookingRow = this.bookingCards.nth(bookingIndex);
    const acceptBtn = bookingRow.getByRole('button', { name: /accept|confirm/i });
    await acceptBtn.click();

    // Confirm acceptance if dialog appears
    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }
  }

  async acceptBookingById(bookingId: string): Promise<void> {
    const bookingRow = this.page.locator('tr').filter({ hasText: bookingId }).first();
    const acceptBtn = bookingRow.getByRole('button', { name: /accept|confirm/i });
    await acceptBtn.click();

    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }
  }

  async rejectBooking(bookingIndex: number, reason: string): Promise<void> {
    const bookingRow = this.bookingCards.nth(bookingIndex);
    const rejectBtn = bookingRow.getByRole('button', { name: /reject|decline/i });
    await rejectBtn.click();

    // Fill rejection reason if textarea appears
    if (await this.rejectReasonInput.isVisible({ timeout: 2000 })) {
      await this.rejectReasonInput.fill(reason);
    }
    await this.page.getByRole('button', { name: /confirm|submit/i }).click();
  }

  async rejectBookingById(bookingId: string, reason: string): Promise<void> {
    const bookingRow = this.page.locator('tr').filter({ hasText: bookingId }).first();
    const rejectBtn = bookingRow.getByRole('button', { name: /reject|decline/i });
    await rejectBtn.click();

    if (await this.rejectReasonInput.isVisible({ timeout: 2000 })) {
      await this.rejectReasonInput.fill(reason);
    }
    await this.page.getByRole('button', { name: /confirm|submit/i }).click();
  }

  async getBookingDetails(index: number): Promise<{
    clientName: string;
    eventDate: string;
    status: string;
    amount: string;
  }> {
    const row = this.bookingCards.nth(index);
    const cells = row.locator('td');

    return {
      clientName: (await cells.nth(1).textContent()) || '', // Customer column
      eventDate: (await cells.nth(5).textContent()) || '', // Date column
      status: (await cells.nth(4).textContent()) || '', // Status column
      amount: (await cells.nth(3).textContent()) || '', // Price column
    };
  }

  // Profile management methods
  async updateProfile(data: {
    businessName?: string;
    description?: string;
    minPrice?: number;
    maxPrice?: number;
    phone?: string;
    email?: string;
  }): Promise<void> {
    await this.editProfileButton.click();

    if (data.businessName) {
      await this.businessNameInput.clear();
      await this.businessNameInput.fill(data.businessName);
    }
    if (data.description) {
      await this.descriptionInput.clear();
      await this.descriptionInput.fill(data.description);
    }
    if (data.minPrice) {
      await this.minPriceInput.clear();
      await this.minPriceInput.fill(data.minPrice.toString());
    }
    if (data.maxPrice) {
      await this.maxPriceInput.clear();
      await this.maxPriceInput.fill(data.maxPrice.toString());
    }
    if (data.phone) {
      await this.phoneInput.clear();
      await this.phoneInput.fill(data.phone);
    }
    if (data.email) {
      await this.emailInput.clear();
      await this.emailInput.fill(data.email);
    }

    await this.saveProfileButton.click();
  }

  // Gallery management methods
  async uploadImage(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async getGalleryImagesCount(): Promise<number> {
    return await this.galleryImages.count();
  }

  async deleteImage(imageIndex: number): Promise<void> {
    const imageCard = this.galleryImages.nth(imageIndex);
    await imageCard.hover();
    const deleteBtn = imageCard.locator('..').getByRole('button', { name: /delete/i });
    await deleteBtn.click();
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click();
  }

  async expectDashboardLoaded(): Promise<void> {
    // Wait for "Welcome Back" heading
    await expect(this.page.locator('h1').filter({ hasText: /Welcome Back/i })).toBeVisible({ timeout: 10000 });
  }

  async expectBookingsLoaded(): Promise<void> {
    await expect(this.bookingsList).toBeVisible({ timeout: 10000 });
  }
}
