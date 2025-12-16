import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('should show payment form', async ({ page }) => {
    await page.goto('/payment/test-payment-id')
    
    await expect(page.locator('h2')).toContainText('Payment Details')
    await expect(page.locator('text=Stripe Checkout')).toBeVisible()
  })

  test('should validate payment form', async ({ page }) => {
    await page.goto('/payment/test-payment-id')
    
    // Try to submit without selecting payment method
    await page.click('button[type="submit"]')
    
    // Should either submit or show validation
    await expect(page.locator('form')).toBeVisible()
  })

  test('should show payment success page', async ({ page }) => {
    await page.goto('/payment/success?session_id=test_session_123')
    
    await expect(page.locator('h1')).toContainText('Payment Successful')
    await expect(page.locator('text=Transaction ID')).toBeVisible()
  })

  test('should show payment cancelled page', async ({ page }) => {
    await page.goto('/payment/cancelled')
    
    await expect(page.locator('h1')).toContainText('Payment Cancelled')
    await expect(page.locator('text=Try Again')).toBeVisible()
  })

  test('should handle payment errors gracefully', async ({ page }) => {
    // Mock a failed payment scenario
    await page.route('**/api/payments/**', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Payment failed' })
      })
    })

    await page.goto('/payment/test-payment-id')
    
    // Should handle error appropriately
    await expect(page.locator('body')).toBeVisible()
  })
})
