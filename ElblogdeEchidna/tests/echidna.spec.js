import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/');
    await page.locator('.chapter-nav [data-chapter="tea"]').click();
});

async function choose(page, values) {
    for (let index = 0; index < 3; index++) await page.getByLabel(`Runa ${index + 1}`, { exact: true }).selectOption(values[index]);
}

test('contract validates choices, distinguishes clues, completes and resets', async ({ page }) => {
    await page.locator('.game-submit').click();
    await expect(page.getByLabel('Runa 1', { exact: true })).toBeFocused();
    await expect(page.locator('.game-score')).toHaveText('0 / 6 hipótesis');
    await choose(page, ['Pluma', 'Pluma', 'Libro']);
    await page.locator('.game-submit').click();
    await expect(page.locator('.game-message')).toContainText('deben ser diferentes');
    await expect(page.locator('.contract-history li')).toHaveCount(0);
    await choose(page, ['Libro', 'Pluma', 'Mariposa']);
    await page.locator('.game-submit').click();
    await expect(page.locator('.contract-history li')).toContainText('0 en su lugar · 2 en otro lugar');
    await choose(page, ['Pluma', 'Libro', 'Llave']);
    await page.locator('.game-submit').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.game-message')).toContainText('Contrato descifrado en 2 hipótesis');
    await expect(page.locator('.game-submit')).toBeDisabled();
    for (const slot of await page.locator('.contract-slot').all()) await expect(slot).toBeDisabled();
    await page.getByRole('button', { name: 'Jugar otra vez' }).click();
    await expect(page.locator('.game-score')).toHaveText('0 / 6 hipótesis');
    await expect(page.locator('.contract-history li')).toHaveCount(0);
    for (const slot of await page.locator('.contract-slot').all()) {
        await expect(slot).toHaveValue('');
        await expect(slot).toBeEnabled();
    }
});

test('six unsuccessful guesses reveal the answer and a new contract can begin', async ({ page }) => {
    await choose(page, ['Libro', 'Pluma', 'Mariposa']);
    for (let attempt = 0; attempt < 6; attempt++) await page.locator('.game-submit').click();
    await expect(page.locator('.contract-history li')).toHaveCount(6);
    await expect(page.locator('.game-message')).toContainText('Pluma → Libro → Llave');
    await expect(page.locator('.game-submit')).toBeDisabled();
    await page.getByRole('button', { name: 'Jugar otra vez' }).click();
    await expect(page.locator('.game-submit')).toBeEnabled();
});
