import { test, expect } from '@playwright/test';

test('music, mute, volume and position follow navigation between all profiles', async ({ page }) => {
    await page.goto('/');
    const audio = page.locator('.background-music');
    const toggle = page.locator('.music-toggle');
    await page.locator('.character-nav').getByRole('link', { name: 'Emilia', exact: true }).click();
    await page.locator('.chapter-nav [data-chapter="secrets"]').click();
    await expect.poll(() => audio.evaluate(element => element.paused)).toBe(true);
    await toggle.click();
    await expect.poll(() => audio.evaluate(element => !element.paused)).toBe(true);
    await page.locator('.music-volume').fill('62');
    await expect.poll(() => audio.evaluate(element => Number.isFinite(element.duration))).toBe(true);
    await audio.evaluate(element => { element.currentTime = 12; });
    await expect.poll(() => audio.evaluate(element => !element.seeking && element.currentTime >= 12), { timeout: 15_000 }).toBe(true);
    for (const name of ['Rem', 'Ram', 'Echidna']) {
        await page.locator('.character-nav').getByRole('link', { name, exact: true }).click();
        await expect.poll(() => audio.evaluate(element => !element.paused && !element.muted && element.currentTime >= 12)).toBe(true);
        await expect(page.locator('.music-volume')).toHaveValue('62');
        await expect(audio).toHaveAttribute('src', /music-loop\.mp3$/);
    }
    await toggle.click();
    for (const name of ['Emilia', 'Rem', 'Ram', 'Echidna']) {
        await page.locator('.character-nav').getByRole('link', { name, exact: true }).click();
        await expect.poll(() => audio.evaluate(element => element.paused && element.muted)).toBe(true);
        await expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.music-volume')).toHaveValue('62');
    }
    await toggle.click();
    await expect.poll(() => audio.evaluate(element => !element.paused && !element.muted)).toBe(true);
});

test('music preferences synchronize with another open profile', async ({ context, page }) => {
    await page.goto('/');
    const other = await context.newPage();
    await other.goto('/pages/characters/rem.html');
    await page.locator('.music-toggle').click();
    if (await other.locator('audio').evaluate(element => element.paused)) await other.locator('.music-toggle').click();
    await page.locator('.music-volume').fill('47');
    await expect(other.locator('.music-volume')).toHaveValue('47');
    await page.locator('.music-toggle').click();
    await expect.poll(() => other.locator('audio').evaluate(element => element.paused && element.muted)).toBe(true);
    await other.close();
});

test('blocked audio requires its own button, not unrelated interactions', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('echidna-audio', JSON.stringify({ enabled: true, muted: false, volume: 0.4 }));
        window.audioAttempts = 0;
        HTMLMediaElement.prototype.play = function () {
            if (this.tagName === 'AUDIO') window.audioAttempts++;
            return Promise.reject(new DOMException('Blocked', 'NotAllowedError'));
        };
    });
    await page.goto('/pages/characters/ram.html');
    await expect(page.locator('.music-toggle')).toHaveAccessibleName('Activar música');
    const attempts = await page.evaluate(() => window.audioAttempts);
    await page.locator('.chapter-nav [data-chapter="secrets"]').click();
    await page.locator('.swatch-mint').click();
    expect(await page.evaluate(() => window.audioAttempts)).toBe(attempts);
    await page.locator('.music-toggle').click();
    expect(await page.evaluate(() => window.audioAttempts)).toBe(attempts + 1);
});
