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
        const canonical = `https://echidna-blog.netlify.app${character === 'echidna' ? '/' : `/pages/characters/${character}.html`}`;
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
        expect(schema.url).toBe(canonical);
        expect(schema.isPartOf.url).toBe('https://echidna-blog.netlify.app/');
        for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
            const path = await page.locator(selector).getAttribute('content');
            const imageUrl = new URL(path);
            expect(imageUrl.origin).toBe('https://echidna-blog.netlify.app');
            expect(imageUrl.pathname).toBe(`/social/${character}.jpg`);
            const response = await page.request.get(imageUrl.pathname);
            expect(response.ok()).toBe(true);
            expect(response.headers()['content-type']).toContain('image/jpeg');
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

test('robots and sitemap reference only the four official canonical pages', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Sitemap: https://echidna-blog.netlify.app/sitemap.xml');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
    expect(urls).toEqual([
        'https://echidna-blog.netlify.app/',
        ...['emilia', 'rem', 'ram'].map(character => `https://echidna-blog.netlify.app/pages/characters/${character}.html`),
    ]);
});
