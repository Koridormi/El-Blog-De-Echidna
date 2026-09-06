import { test, expect } from '@playwright/test';

const routes = [
    '/',
];

const viewports = [
    { name: 'mobile', width: 375, height: 812 },

    { name: 'tablet-before', width: 767, height: 1024 },
    { name: 'tablet', width: 768, height: 1024 },

    { name: 'laptop-before', width: 1023, height: 768 },
    { name: 'laptop', width: 1024, height: 768 },

    { name: 'desktop-before', width: 1199, height: 800 },
    { name: 'desktop', width: 1200, height: 800 },

    { name: 'desktopXL-before', width: 1399, height: 900 },
    { name: 'desktopXL', width: 1400, height: 900 },
];

for (const route of routes) {
    for (const viewport of viewports) {

        test(`${route} - ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
            await page.setViewportSize({
                width: viewport.width,
                height: viewport.height,
            });

            const response = await page.goto(route);
            expect(response).not.toBeNull();
            expect(response.ok()).toBe(true);
            await expect(page.locator('html')).toBeVisible();
            await expect(page.locator('body')).toBeVisible();
            const dimensions = await page.evaluate(() => ({
                viewportWidth: document.documentElement.clientWidth,
                documentWidth: document.documentElement.scrollWidth,
                bodyWidth: document.body.scrollWidth,
            }));

            expect(
                dimensions.documentWidth,
                `Overflow horizontal detectado en ${viewport.width}px`
            ).toBeLessThanOrEqual(dimensions.viewportWidth);

            expect(
                dimensions.bodyWidth,
                `El body supera el viewport en ${viewport.width}px`
            ).toBeLessThanOrEqual(dimensions.viewportWidth);
            const main = page.locator('main');

            if (await main.count()) {
                await expect(main).toBeVisible();
            }
            const header = page.locator('header');

            if (await header.count()) {
                await expect(header).toBeVisible();
            }
        });
    };
};