import { test, expect } from '@playwright/test';

test.describe('Playlist CRUD', () => {
  test('should create, edit and view a playlist', async ({ page }) => {
    const timestamp = Date.now();
    const email = `playlist-test-${timestamp}@example.com`;
    const password = 'Password123!';

    await page.goto('/register');
    await page.fill('input[name="name"]', 'Playlist User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    const createBtn = page.locator('button[title="Criar Playlist"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    await page.getByLabel('Título').fill(`E2E Playlist ${timestamp}`);
    await page.getByLabel('Descrição (Opcional)').fill('E2E Description');
    await page.click('button:has-text("Criar Playlist")');

    await expect(page.locator('text=Playlist criada com sucesso!')).toBeVisible();
    await expect(page.locator('aside')).toContainText(`E2E Playlist ${timestamp}`);

    await page.locator('aside').getByText(`E2E Playlist ${timestamp}`).click();

    await page.click('button:has-text("Editar")');
    await page.getByLabel('Título').fill(`Updated Playlist ${timestamp}`);
    await page.click('button:has-text("Salvar")');

    await expect(page.locator('text=Playlist atualizada!')).toBeVisible();
    await expect(page.locator('h1').filter({ hasText: `Updated Playlist ${timestamp}` })).toBeVisible();
  });
});
