import { Page, Locator, expect } from '@playwright/test';

export class StaticPage {
  readonly page: Page;

  // Common elements
  readonly heading: Locator;
  readonly content: Locator;
  readonly lastUpdated: Locator;
  readonly backLink: Locator;
  readonly tocLinks: Locator;

  // Page sections
  readonly sections: Locator;

  // Footer navigation
  readonly footerLinks: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main content
    this.heading = page.locator('h1').first();
    this.content = page.locator('main, article, .prose').first().or(
      page.locator('div').filter({ has: page.locator('h1') }).first()
    );
    this.lastUpdated = page.locator('p, span').filter({ hasText: /Last Updated|Updated|Effective/i });

    // Navigation
    this.backLink = page.getByRole('link', { name: /Back|Home/i }).first();
    this.tocLinks = page.locator('nav a, ul a').filter({ has: page.locator('a[href^="#"]') }).or(
      page.locator('a[href^="#"]')
    );

    // Sections (h2 headers in content)
    this.sections = page.locator('h2');

    // Footer links
    this.footerLinks = page.locator('footer a');
  }

  async gotoTerms(): Promise<void> {
    await this.page.goto('/terms');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoPrivacy(): Promise<void> {
    await this.page.goto('/privacy');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCookies(): Promise<void> {
    await this.page.goto('/cookies');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoAbout(): Promise<void> {
    await this.page.goto('/about');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoContact(): Promise<void> {
    await this.page.goto('/contact');
    await this.page.waitForLoadState('networkidle');
  }

  async goto404(): Promise<void> {
    await this.page.goto('/this-page-does-not-exist-404-test');
    await this.page.waitForLoadState('networkidle');
  }

  async expectHeading(text: string): Promise<void> {
    await expect(this.heading).toContainText(text, { ignoreCase: true });
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async expectContentVisible(): Promise<void> {
    await expect(this.content).toBeVisible({ timeout: 10000 });
  }

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent()) || '';
  }

  async getTableOfContents(): Promise<string[]> {
    const tocCount = await this.tocLinks.count();
    const items: string[] = [];
    for (let i = 0; i < tocCount; i++) {
      const text = await this.tocLinks.nth(i).textContent();
      if (text) items.push(text.trim());
    }
    return items;
  }

  async getSectionHeaders(): Promise<string[]> {
    const count = await this.sections.count();
    const headers: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.sections.nth(i).textContent();
      if (text) headers.push(text.trim());
    }
    return headers;
  }

  async clickTocLink(index: number): Promise<void> {
    await this.tocLinks.nth(index).click();
  }

  async clickTocLinkByText(text: string): Promise<void> {
    await this.tocLinks.filter({ hasText: text }).first().click();
  }

  async getLastUpdatedDate(): Promise<string> {
    const text = await this.lastUpdated.textContent();
    if (text) {
      // Extract date from text like "Last Updated: January 1, 2024"
      const match = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}/);
      return match ? match[0] : text.trim();
    }
    return '';
  }

  async expectLastUpdatedVisible(): Promise<void> {
    await expect(this.lastUpdated).toBeVisible({ timeout: 5000 });
  }

  async navigateToHome(): Promise<void> {
    await this.backLink.click();
    await expect(this.page).toHaveURL('/');
  }

  // 404 page specific methods
  async expect404Page(): Promise<void> {
    const notFoundIndicator = this.page.locator('h1, h2, p').filter({
      hasText: /404|not found|page.*exist|couldn't find/i,
    });
    await expect(notFoundIndicator.first()).toBeVisible({ timeout: 10000 });
  }

  async expect404Message(): Promise<void> {
    const message = this.page.locator('p').filter({
      hasText: /page.*not.*found|doesn't exist|couldn't find/i,
    });
    await expect(message.first()).toBeVisible({ timeout: 10000 });
  }

  async expect404HomeLink(): Promise<void> {
    const homeLink = this.page.getByRole('link', { name: /Home|Go.*Home|Back.*Home/i });
    await expect(homeLink).toBeVisible({ timeout: 5000 });
  }

  async click404HomeLink(): Promise<void> {
    const homeLink = this.page.getByRole('link', { name: /Home|Go.*Home|Back.*Home/i });
    await homeLink.click();
    await expect(this.page).toHaveURL('/');
  }

  // Footer navigation helpers
  async clickFooterLink(text: string): Promise<void> {
    await this.footerLinks.filter({ hasText: text }).first().click();
  }

  async expectFooterLinkVisible(text: string): Promise<void> {
    await expect(this.footerLinks.filter({ hasText: text }).first()).toBeVisible();
  }

  async getFooterLinks(): Promise<string[]> {
    const count = await this.footerLinks.count();
    const links: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.footerLinks.nth(i).textContent();
      if (text) links.push(text.trim());
    }
    return links;
  }

  async expectPageLoaded(): Promise<void> {
    await this.expectHeadingVisible();
    await this.expectContentVisible();
  }
}
