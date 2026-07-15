import { Page, Locator, expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly dashboardStats: Locator;
  readonly sidebarNav: Locator;
  readonly vendorsLink: Locator;
  readonly reviewsLink: Locator;
  readonly categoriesLink: Locator;
  readonly servicesLink: Locator;

  // Vendor management
  readonly vendorsList: Locator;
  readonly pendingVendorsTab: Locator;
  readonly approvedVendorsTab: Locator;
  readonly rejectedVendorsTab: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly rejectReasonInput: Locator;

  // Review management
  readonly reviewsList: Locator;
  readonly pendingReviewsTab: Locator;
  readonly approvedReviewsTab: Locator;
  readonly rejectedReviewsTab: Locator;
  readonly approveReviewButton: Locator;
  readonly rejectReviewButton: Locator;

  // Category management
  readonly categoriesList: Locator;
  readonly addCategoryButton: Locator;
  readonly categoryNameInput: Locator;
  readonly categoryDescriptionInput: Locator;
  readonly saveCategoryButton: Locator;
  readonly deleteCategoryButton: Locator;

  // Service management
  readonly servicesList: Locator;
  readonly addServiceButton: Locator;
  readonly serviceNameInput: Locator;
  readonly saveServiceButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dashboard stats section
    this.dashboardStats = page.locator('section').first();
    this.sidebarNav = page.locator('aside, nav');

    // Navigation links - Quick Actions and sidebar
    this.vendorsLink = page.getByRole('link', { name: /vendors|Add New Vendor/i }).first();
    this.reviewsLink = page.getByRole('link', { name: /reviews/i });
    this.categoriesLink = page.getByRole('link', { name: /categories|Add New Category/i }).first();
    this.servicesLink = page.getByRole('link', { name: /services|Add New Service/i }).first();

    // Vendor management - Pending Vendor Applications table or grid
    this.vendorsList = page.locator('table, .grid').first();
    this.pendingVendorsTab = page.getByRole('tab', { name: /pending/i }).or(
      page.getByRole('button', { name: /pending/i })
    );
    this.approvedVendorsTab = page.getByRole('tab', { name: /approved/i }).or(
      page.getByRole('button', { name: /approved/i })
    );
    this.rejectedVendorsTab = page.getByRole('tab', { name: /rejected/i }).or(
      page.getByRole('button', { name: /rejected/i })
    );
    this.approveButton = page.getByRole('button', { name: /Approve/i });
    this.rejectButton = page.getByRole('button', { name: /Reject/i });
    this.rejectReasonInput = page.locator('textarea[name="rejectionReason"]').or(
      page.getByPlaceholder(/reason/i)
    );

    // Review management
    this.reviewsList = page.locator('table').first();
    this.pendingReviewsTab = page.getByRole('tab', { name: /pending/i });
    this.approvedReviewsTab = page.getByRole('tab', { name: /approved/i });
    this.rejectedReviewsTab = page.getByRole('tab', { name: /rejected/i });
    this.approveReviewButton = page.getByRole('button', { name: /approve/i });
    this.rejectReviewButton = page.getByRole('button', { name: /reject/i });

    // Category management
    this.categoriesList = page.locator('div').filter({ has: page.locator('h3') });
    this.addCategoryButton = page.getByRole('button', { name: /add.*category/i }).or(
      page.getByRole('link', { name: /add.*category/i })
    );
    this.categoryNameInput = page.locator('input[name="categoryName"], input[name="name"]');
    this.categoryDescriptionInput = page.locator('textarea[name="categoryDescription"], textarea[name="description"]');
    this.saveCategoryButton = page.getByRole('button', { name: /save|create/i });
    this.deleteCategoryButton = page.getByRole('button', { name: /delete/i });

    // Service management
    this.servicesList = page.locator('div').filter({ has: page.locator('h3') });
    this.addServiceButton = page.getByRole('button', { name: /add.*service/i }).or(
      page.getByRole('link', { name: /add.*service/i })
    );
    this.serviceNameInput = page.locator('input[name="serviceName"], input[name="name"]');
    this.saveServiceButton = page.getByRole('button', { name: /save|create/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin');
  }

  async goToVendors(): Promise<void> {
    await this.page.getByRole('link', { name: /Manage →/i }).first().or(
      this.page.locator('a[href="/admin/vendors"]')
    ).click();
    await expect(this.page).toHaveURL(/admin\/vendors/);
  }

  async goToReviews(): Promise<void> {
    await this.reviewsLink.click();
    await expect(this.page).toHaveURL(/reviews/);
  }

  async goToCategories(): Promise<void> {
    await this.page.getByRole('link', { name: /Add New Category/i }).or(
      this.page.locator('a[href="/admin/categories"]')
    ).click();
    await expect(this.page).toHaveURL(/admin\/categories/);
  }

  async goToServices(): Promise<void> {
    await this.page.getByRole('link', { name: /Add New Service/i }).or(
      this.page.locator('a[href="/admin/services"]')
    ).click();
    await expect(this.page).toHaveURL(/admin\/services/);
  }

  // Vendor management methods
  async selectPendingVendors(): Promise<void> {
    await this.pendingVendorsTab.click();
  }

  async selectApprovedVendors(): Promise<void> {
    await this.approvedVendorsTab.click();
  }

  async selectRejectedVendors(): Promise<void> {
    await this.rejectedVendorsTab.click();
  }

  async approveVendor(vendorIndex: number = 0): Promise<void> {
    // In dashboard, pending vendor applications are in a table or grid
    const vendorRow = this.page.locator('.grid > div, table tbody tr').nth(vendorIndex);
    await vendorRow.getByRole('button', { name: /Approve/i }).click();

    // Handle confirmation dialog (uses window.confirm)
    this.page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  async approveVendorById(userId: string): Promise<void> {
    const vendorRow = this.page.locator('tr').filter({ hasText: userId }).first();
    await vendorRow.getByRole('button', { name: /Approve/i }).click();

    this.page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  async rejectVendor(vendorIndex: number, reason: string): Promise<void> {
    const vendorRow = this.page.locator('.grid > div, table tbody tr').nth(vendorIndex);
    await vendorRow.getByRole('button', { name: /Reject/i }).click();

    // Handle window.prompt for rejection reason
    this.page.on('dialog', async (dialog) => {
      await dialog.accept(reason);
    });
  }

  async rejectVendorById(userId: string, reason: string): Promise<void> {
    const vendorRow = this.page.locator('tr').filter({ hasText: userId }).first();
    await vendorRow.getByRole('button', { name: /Reject/i }).click();

    this.page.on('dialog', async (dialog) => {
      await dialog.accept(reason);
    });
  }

  // Review management methods
  async selectPendingReviews(): Promise<void> {
    await this.pendingReviewsTab.click();
  }

  async approveReview(reviewIndex: number = 0): Promise<void> {
    const reviewRow = this.page.locator('table tbody tr').nth(reviewIndex);
    await reviewRow.getByRole('button', { name: /approve/i }).click();

    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }
  }

  async approveReviewById(reviewId: string): Promise<void> {
    const reviewRow = this.page.locator('tr').filter({ hasText: reviewId }).first();
    await reviewRow.getByRole('button', { name: /approve/i }).click();

    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }
  }

  async rejectReview(reviewIndex: number, reason: string): Promise<void> {
    const reviewRow = this.page.locator('table tbody tr').nth(reviewIndex);
    await reviewRow.getByRole('button', { name: /reject/i }).click();

    const reasonInput = this.page.locator('textarea[name="rejectionReason"]');
    if (await reasonInput.isVisible({ timeout: 2000 })) {
      await reasonInput.fill(reason);
    }
    await this.page.getByRole('button', { name: /confirm|submit/i }).click();
  }

  async rejectReviewById(reviewId: string, reason: string): Promise<void> {
    const reviewRow = this.page.locator('tr').filter({ hasText: reviewId }).first();
    await reviewRow.getByRole('button', { name: /reject/i }).click();

    const reasonInput = this.page.locator('textarea[name="rejectionReason"]');
    if (await reasonInput.isVisible({ timeout: 2000 })) {
      await reasonInput.fill(reason);
    }
    await this.page.getByRole('button', { name: /confirm|submit/i }).click();
  }

  // Category management methods
  async addCategory(name: string, description: string): Promise<void> {
    await this.addCategoryButton.click();
    await this.categoryNameInput.fill(name);
    await this.categoryDescriptionInput.fill(description);
    await this.saveCategoryButton.click();
  }

  async deleteCategory(categoryIndex: number): Promise<void> {
    const categoryCards = this.page.locator('div').filter({ has: this.page.locator('h3') });
    const categoryCard = categoryCards.nth(categoryIndex);
    await categoryCard.getByRole('button', { name: /delete/i }).click();

    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }
  }

  // Service management methods
  async addService(name: string): Promise<void> {
    await this.addServiceButton.click();
    await this.serviceNameInput.fill(name);
    await this.saveServiceButton.click();
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalVendors: string;
    pendingVendors: string;
    totalUsers: string;
    totalBookings: string;
  }> {
    await this.page.waitForLoadState('networkidle');

    let totalVendors = '0';
    let pendingVendors = '0';
    let totalUsers = '0';
    let totalBookings = '0';

    try {
      // Get Total Vendors from stat card
      const vendorsCard = this.page.locator('div').filter({ hasText: /Total Vendors/i }).first();
      totalVendors = (await vendorsCard.locator('p.text-3xl').first().textContent()) || '0';
    } catch {
      // Keep default
    }

    try {
      // Get Pending Applications
      const pendingCard = this.page.locator('div').filter({ hasText: /Pending Applications/i }).first();
      pendingVendors = (await pendingCard.locator('p.text-3xl').first().textContent()) || '0';
    } catch {
      // Keep default
    }

    try {
      // Get Users
      const usersCard = this.page.locator('div').filter({ hasText: /^Users$/i }).first();
      totalUsers = (await usersCard.locator('p.text-3xl').first().textContent()) || '0';
    } catch {
      // Keep default
    }

    try {
      // Get Bookings
      const bookingsCard = this.page.locator('div').filter({ hasText: /^Bookings$/i }).first();
      totalBookings = (await bookingsCard.locator('p.text-3xl').first().textContent()) || '0';
    } catch {
      // Keep default
    }

    return { totalVendors, pendingVendors, totalUsers, totalBookings };
  }

  async expectDashboardLoaded(): Promise<void> {
    // Wait for "Dashboard" heading
    await expect(this.page.locator('h1').filter({ hasText: /Dashboard/i })).toBeVisible({ timeout: 10000 });
  }

  async getPendingApplicationsCount(): Promise<number> {
    // Count rows in the Pending Vendor Applications table
    const tableRows = this.page.locator('table tbody tr');
    return await tableRows.count();
  }

  async getRecentBookingsCount(): Promise<number> {
    // Count rows in Recent Bookings table (there might be multiple tables)
    const tables = this.page.locator('table');
    const count = await tables.count();
    if (count > 1) {
      // Second table is usually Recent Bookings
      return await tables.nth(1).locator('tbody tr').count();
    }
    return 0;
  }
}
