import { test, expect } from '@playwright/test';

for (const character of ['echidna', 'emilia', 'rem', 'ram']) {
    test(`${character}: six curiosities, basic SEO and accessible navigation`, async ({ page }) => {
        await page.goto(character === 'echidna' ? '/' : `/pages/characters/${character}.html`);
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
        await expect(page.locator('h1')).toHaveCount(1);
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        expect(description.length).toBeGreaterThan(80);
        expect(description).toContain(character[0].toUpperCase() + character.slice(1));
        const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
        expect(schema['@type']).toBe('WebPage');
        expect(schema.inLanguage).toBe('es');
        for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
            const path = await page.locator(selector).getAttribute('content');
            const response = await page.request.get(new URL(path, page.url()).href);
            expect(response.ok()).toBe(true);
        }
        await page.keyboard.press('Tab');
        await expect(page.locator('.skip-link')).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('main')).toBeFocused();
        await page.locator('.chapter-nav [data-chapter="secrets"]').click();
        const entries = new Set();
        for (let index = 0; index < 6; index++) {
            await expect(page.locator('.secret-count')).toHaveText(`0${index + 1} / 06`);
            entries.add(await page.locator('.secret-text').textContent());
            await page.locator('.secret-next').click();
        }
        expect(entries.size).toBe(6);
        await expect(page.locator('.secret-count')).toHaveText('01 / 06');
        await page.locator('.secret-prev').click();
        await expect(page.locator('.secret-count')).toHaveText('06 / 06');
        await page.locator('.character-facts [data-open-file]').click();
        await expect(page.locator('dialog')).toBeVisible();
        await expect(page.locator('dialog details')).toHaveCount(6);
        await page.locator('dialog summary').first().click();
        await expect(page.locator('dialog details').first()).toHaveAttribute('open', '');
        await page.keyboard.press('Escape');
        await expect(page.locator('.character-facts [data-open-file]')).toBeFocused();
        expect(await page.locator('img:not([alt])').count()).toBe(0);
    });
}
