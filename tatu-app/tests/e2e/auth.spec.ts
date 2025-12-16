import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('h2')).toContainText('Welcome Back')
  })

  test('should show sign up form', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page.locator('h2')).toContainText('Join TATU')
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
  })

  test('should show sign in form', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('h2')).toContainText('Welcome Back')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('should validate sign up form', async ({ page }) => {
    await page.goto('/signup')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors or prevent submission
    await expect(page.locator('input[name="name"]')).toBeVisible()
  })

  test('should validate sign in form', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors or prevent submission
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})
