import { test, expect } from '@playwright/test';

const characters = ['Emilia', 'Rem', 'Ram'];
const widths = [375, 767, 768, 1023, 1024, 1199, 1200, 1399, 1400];

for (const character of characters) {
    test(`${character}: direct access, resources and responsive layout`, async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
            if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
        });
        const response = await page.goto(`/pages/characters/${character.toLowerCase()}.html`);
        expect(response.ok()).toBe(true);
        await expect(page).toHaveTitle(`${character} | Re:Zero Fan Space`);
        await expect(page.locator('.character-nav [aria-current="page"]')).toHaveText(character);
        await expect(page.locator('.profile-status')).toHaveText('Perfil en preparación');

        for (const width of widths) {
            await page.setViewportSize({ width, height: 900 });
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('.profile-return')).toBeVisible();
            const dimensions = await page.evaluate(() => ({
                viewport: innerWidth,
                document: document.documentElement.scrollWidth,
                body: document.body.scrollWidth,
            }));
            expect(dimensions.document, `Document overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
            expect(dimensions.body, `Body overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
        }
        expect(errors).toEqual([]);
    });
}

test('character navigation works without JavaScript and returns to Echidna', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto('/');
    for (const character of characters) {
        await page.getByRole('navigation', { name: 'Personajes de Re:Zero' }).getByRole('link', { name: character, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/pages/characters/${character.toLowerCase()}\\.html$`));
        await expect(page.locator('h1')).toHaveText(`${character.toUpperCase()}.`);
    }
    await page.getByRole('link', { name: 'Volver al santuario de Echidna' }).click();
    await expect(page).toHaveURL(`${baseURL}/`);
    await expect(page.locator('h1')).toHaveText('ECHIDNA.');
    await context.close();
});

for (const character of characters) {
    test(character + ': shared template, transparent WebP and placeholder controls', async ({ page }) => {
        await page.goto('/pages/characters/' + character.toLowerCase() + '.html');
        for (const selector of ['.character-sheet', '.character-copy', '.character-stage', '.memory-cards', '.mini-player', '.sheet-bottom']) {
            await expect(page.locator(selector)).toBeVisible();
        }
        const image = page.locator('.character-image');
        await expect(image).toHaveAttribute('src', /-character\.webp$/);
        const pixels = await image.evaluate(element => {
            const canvas = document.createElement('canvas');
            canvas.width = element.naturalWidth;
            canvas.height = element.naturalHeight;
            const context = canvas.getContext('2d');
            context.drawImage(element, 0, 0);
            return [context.getImageData(0, 0, 1, 1).data[3], context.getImageData(512, 768, 1, 1).data[3]];
        });
        expect(pixels[0]).toBe(0);
        expect(pixels[1]).toBeGreaterThan(200);
        await expect(page.locator('.music-toggle')).toBeEnabled();
        await expect(page.locator('.player-toggle')).toBeDisabled();
        await expect(page.locator('.scene-placeholder')).toContainText('GIF pendiente');
        await page.locator('.memory-card[data-chapter="secrets"]').click();
        await expect(page.locator('#secrets-panel')).toBeVisible();
        await page.locator('.secret-prev').click();
        await expect(page.locator('.secret-count')).toHaveText('06 / 06');
        await page.locator('.secret-next').click();
        await expect(page.locator('.secret-count')).toHaveText('01 / 06');
        await page.locator('.next-chapter').click();
        await expect(page.locator('#tea-panel')).toBeVisible();
        await page.locator('.next-chapter').click();
        await expect(page.locator('#profile-panel')).toBeVisible();
        await page.locator('.read-file').click();
        await expect(page.locator('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('dialog')).not.toBeVisible();
        await page.locator('.swatch-mint').click();
        await page.reload();
        await expect(page.locator('body')).toHaveAttribute('data-theme', 'mint');
        await page.locator('.butterfly-button').click();
        await expect(page.locator('.butterfly-note')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('.butterfly-note')).not.toBeVisible();
        await page.locator('.motion-button').click();
        await expect(page.locator('html')).toHaveClass('motion-paused');
    });
}
