import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register a new user (listener)', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test-reg-${timestamp}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test Listener');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.selectOption('select[name="role"]', 'listener');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Sua Biblioteca')).toBeVisible();
  });

  test('should login with a registered user', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test-login-${timestamp}@example.com`;
    const password = 'Password123!';

    await page.goto('/register');
    await page.fill('input[name="name"]', 'Login User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    await page.click('button:has(svg.lucide-user)');
    await page.click('text=Sair da conta');
    await expect(page).toHaveURL(/.*login/);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should fail login with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Verifique suas credenciais')).toBeVisible();
  });
});
