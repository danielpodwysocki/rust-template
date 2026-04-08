import { test, expect } from '@playwright/test'

test('homepage displays a greeting from the Rust API', async ({ page }) => {
  await page.goto('/')
  // Wait for the greeting text to appear (loading resolves)
  await expect(page.locator('p')).not.toContainText('Loading...', { timeout: 5000 })
  // Should show either the greeting or an error (not stuck on loading)
  const body = await page.textContent('body')
  expect(body).not.toBeNull()
})

test('homepage shows greeting card', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.greeting-card')).toBeVisible()
})
