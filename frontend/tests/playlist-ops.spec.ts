import { test, expect } from '@playwright/test';

test.describe('Playlist Operations', () => {
  test('should follow a playlist found in search', async ({ browser }) => {
    const timestamp = Date.now();
    const ownerEmail = `owner-${timestamp}@example.com`;
    const followerEmail = `follower-${timestamp}@example.com`;
    const password = 'Password123!';

    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await ownerPage.goto('http://localhost:5173/register');
    await ownerPage.fill('input[name="name"]', 'Owner User');
    await ownerPage.fill('input[name="email"]', ownerEmail);
    await ownerPage.fill('input[name="password"]', password);
    await ownerPage.selectOption('select[name="role"]', 'listener');
    await ownerPage.click('button[type="submit"]');
    await expect(ownerPage).toHaveURL(/.*dashboard/);

    await ownerPage.click('button[title="Criar Playlist"]');
    await ownerPage.getByLabel('Título').fill(`Public Playlist ${timestamp}`);
    await ownerPage.click('button:has-text("Criar Playlist")');
    await expect(ownerPage.locator('text=Playlist criada com sucesso!')).toBeVisible();
    await ownerPage.close();

    const followerContext = await browser.newContext();
    const followerPage = await followerContext.newPage();
    await followerPage.goto('http://localhost:5173/register');
    await followerPage.fill('input[name="name"]', 'Follower User');
    await followerPage.fill('input[name="email"]', followerEmail);
    await followerPage.fill('input[name="password"]', password);
    await followerPage.selectOption('select[name="role"]', 'listener');
    await followerPage.click('button[type="submit"]');
    await expect(followerPage).toHaveURL(/.*dashboard/);

    await followerPage.fill('input[placeholder*="O que você quer ouvir?"]', `Public Playlist ${timestamp}`);
    await followerPage.keyboard.press('Enter');

    await followerPage.click('button:has-text("Playlists (")');
    const followBtn = followerPage.locator('button[title="Adicionar à biblioteca"]');
    await followBtn.click();

    await expect(followerPage.locator('text=Playlist adicionada à sua biblioteca!')).toBeVisible();
    
    await expect(followerPage.locator('aside')).toContainText(`Public Playlist ${timestamp}`);

    await followerPage.close();
  });

  test('should not find a private playlist in search', async ({ browser }) => {
    const timestamp = Date.now();
    const ownerEmail = `owner-priv-${timestamp}@example.com`;
    const searcherEmail = `searcher-priv-${timestamp}@example.com`;
    const password = 'Password123!';

    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await ownerPage.goto('http://localhost:5173/register');
    await ownerPage.fill('input[name="name"]', 'Owner Private User');
    await ownerPage.fill('input[name="email"]', ownerEmail);
    await ownerPage.fill('input[name="password"]', password);
    await ownerPage.selectOption('select[name="role"]', 'listener');
    await ownerPage.click('button[type="submit"]');
    await expect(ownerPage).toHaveURL(/.*dashboard/);

    await ownerPage.click('button[title="Criar Playlist"]');
    await ownerPage.getByLabel('Título').fill(`Private Playlist ${timestamp}`);
    
    await ownerPage.locator('input[type="checkbox"]').check();
    
    await ownerPage.click('button:has-text("Criar Playlist")');
    await expect(ownerPage.locator('text=Playlist criada com sucesso!')).toBeVisible();
    await ownerPage.close();

    const searcherContext = await browser.newContext();
    const searcherPage = await searcherContext.newPage();
    await searcherPage.goto('http://localhost:5173/register');
    await searcherPage.fill('input[name="name"]', 'Searcher User');
    await searcherPage.fill('input[name="email"]', searcherEmail);
    await searcherPage.fill('input[name="password"]', password);
    await searcherPage.selectOption('select[name="role"]', 'listener');
    await searcherPage.click('button[type="submit"]');
    await expect(searcherPage).toHaveURL(/.*dashboard/);

    await searcherPage.fill('input[placeholder*="O que você quer ouvir?"]', `Private Playlist ${timestamp}`);
    await searcherPage.keyboard.press('Enter');

    await searcherPage.click('button:has-text("Playlists (")');
    await expect(searcherPage.locator('text=Nenhuma playlist encontrada.')).toBeVisible();

    await searcherPage.close();
  });
});
