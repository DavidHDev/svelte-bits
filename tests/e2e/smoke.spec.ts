import { expect, test } from '@playwright/test';

test('landing page renders and lazy demo cards are visible', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /svelte components for/i })).toBeVisible();
	await page.getByRole('heading', { name: 'See them in action' }).scrollIntoViewIfNeeded();
	await expect(page.getByRole('link', { name: /ShapeGrid/i })).toBeVisible();
});

test('search opens with slash, navigates, and closes with escape', async ({ page }) => {
	await page.goto('/get-started/introduction');
	await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
	await page.keyboard.press('Slash');
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await page.getByRole('combobox').fill('noise');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/animations\/noise$/);

	await page.keyboard.press('/');
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();
});

test('code tab lazy-loads highlighted source', async ({ page }) => {
	await page.goto('/animations/noise');
	await page.getByRole('tab', { name: 'Code' }).click();
	await expect(page.getByRole('tabpanel')).toContainText('Component source');
	await expect(page.locator('.code-highlighter').first()).toBeVisible();
});

test('hyperspeed preview loads and preset selector works', async ({ page }) => {
	await page.goto('/backgrounds/hyperspeed');
	await expect(page.getByRole('heading', { name: 'Hyperspeed' })).toBeVisible();
	await page.getByRole('button', { name: 'Animation Preset' }).click();
	await page.getByRole('option', { name: 'Golden' }).click();
	await expect(page.getByRole('button', { name: 'Animation Preset' })).toContainText('Golden');
});
