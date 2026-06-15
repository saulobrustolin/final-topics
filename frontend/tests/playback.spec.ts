import { test, expect } from '@playwright/test';

test.describe('Playback and Player', () => {
  test('should show player bar and control volume/mute', async ({ page }) => {
    const timestamp = Date.now();
    const email = `player-test-${timestamp}@example.com`;
    const password = 'Password123!';

    await page.goto('/register');
    await page.fill('input[name="name"]', 'Player User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    const playerBar = page.locator('footer');
    await expect(playerBar).toBeVisible();
    await expect(playerBar.locator('text=Nenhuma música tocando')).toBeVisible();

    const volumeBtn = playerBar.locator('button').filter({ has: page.locator('svg[class*="lucide-volume"]') });
    await expect(volumeBtn).toBeVisible();
    await volumeBtn.click();
    
    await expect(playerBar.locator('svg[class*="lucide-volume-x"]')).toBeVisible();
  });
});
