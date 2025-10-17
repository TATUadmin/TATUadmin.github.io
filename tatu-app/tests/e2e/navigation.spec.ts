import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('h1')).toContainText('Find Your Perfect Tattoo Artist')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about')
    
    await expect(page.locator('h1')).toContainText('About TATU')
  })

  test('should navigate to how it works page', async ({ page }) => {
    await page.goto('/how-it-works')
    
    await expect(page.locator('h1')).toContainText('How It Works')
  })

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/explore')
    
    await expect(page.locator('h1')).toContainText('Explore Artists')
  })

  test('should show mobile navigation on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Mobile navigation should be visible
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
  })

  test('should navigate to artist profile', async ({ page }) => {
    await page.goto('/artist/test-artist-id')
    
    // Should show artist profile or redirect appropriately
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page')
    
    // Should return 404 or redirect to appropriate page
    expect(response?.status()).toBeGreaterThanOrEqual(404)
  })
})
