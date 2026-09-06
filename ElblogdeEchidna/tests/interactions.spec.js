import { test, expect } from '@playwright/test';

test('chapters, curiosity controls and character dialog work', async ({ page }) => {
    await page.goto('/');
    await page.locator('.memory-card[data-chapter="secrets"]').click();
    await expect(page.locator('#secrets-panel')).toBeVisible();
    await page.locator('.secret-prev').click();
    await expect(page.locator('.secret-count')).toHaveText('04 / 04');
    await page.locator('.secret-next').click();
    await expect(page.locator('.secret-count')).toHaveText('01 / 04');
    await page.locator('.next-chapter').click();
    await expect(page.locator('#tea-panel')).toBeVisible();
    await page.locator('.next-chapter').click();
    await expect(page.locator('#profile-panel')).toBeVisible();

    const trigger = page.locator('.read-file');
    const dialog = page.locator('.character-dialog');
    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator('.dialog-close').click();
    await expect(dialog).not.toBeVisible();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toBeVisible();
});

test('tea has 99 distinct responses and resets to zero', async ({ page }) => {
    await page.goto('/');
    await page.locator('.chapter-nav [data-chapter="tea"]').click();
    const reactions = new Set();
    for (let count = 1; count <= 99; count++) {
        await page.locator('.pour-button').click();
        await expect(page.locator('.tea-count')).toHaveText(`${count} ${count === 1 ? 'taza' : 'tazas'}`);
        reactions.add(await page.locator('.tea-reaction').textContent());
    }
    expect(reactions.size).toBe(99);
    await page.locator('.pour-button').click();
    await expect(page.locator('.tea-count')).toHaveText('0 tazas');
    await expect(page.locator('.tea-reaction')).toContainText('nueva ronda');
    await page.locator('.pour-button').click();
    await expect(page.locator('.tea-count')).toHaveText('1 taza');
    await expect(page.locator('.tea-reaction')).toHaveText([...reactions][0]);
});

test('themes persist and butterfly notes close', async ({ page }) => {
    await page.goto('/');
    for (const theme of ['ice', 'mint', 'lilac']) {
        await page.locator(`[data-theme="${theme}"].swatch`).click();
        await page.reload();
        await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
        await expect(page.locator(`[data-theme="${theme}"].swatch`)).toHaveAttribute('aria-pressed', 'true');
    }
    await page.locator('.butterfly-button').click();
    await expect(page.locator('.butterfly-note')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.butterfly-note')).not.toBeVisible();
    await page.locator('.butterfly-button').click();
    await page.mouse.click(2, 2);
    await expect(page.locator('.butterfly-note')).not.toBeVisible();
});

test('music plays after interaction and remembers mute and volume', async ({ page }) => {
    await page.goto('/');
    await page.locator('.chapter-nav [data-chapter="tea"]').click();
    const audio = page.locator('.background-music');
    const toggle = page.locator('.music-toggle');
    const volume = page.locator('.music-volume');
    await expect.poll(() => audio.evaluate(element => !element.paused && element.currentTime > 0)).toBe(true);
    await expect(volume).toHaveValue('35');
    await toggle.click();
    await expect.poll(() => audio.evaluate(element => element.muted)).toBe(true);
    await page.reload();
    await expect.poll(() => audio.evaluate(element => element.muted)).toBe(true);
    await toggle.click();
    await expect.poll(() => audio.evaluate(element => element.muted)).toBe(false);
    await volume.focus();
    await volume.press('End');
    await expect(page.locator('.music-level')).toHaveText('100 %');
    await expect.poll(() => audio.evaluate(element => element.volume)).toBe(1);
    await page.reload();
    await expect(volume).toHaveValue('100');
    await volume.focus();
    await volume.press('Home');
    await expect.poll(() => audio.evaluate(element => element.volume === 0 && element.muted)).toBe(true);
    await toggle.click();
    await expect.poll(() => audio.evaluate(element => element.volume === 1 && !element.muted)).toBe(true);
});

test('animation autoplays and its controls pause and resume', async ({ page }) => {
    await page.goto('/');
    const video = page.locator('.tea-animation');
    await expect.poll(() => video.evaluate(element => !element.paused && element.currentTime > 0)).toBe(true);
    await page.locator('.player-toggle').click();
    await expect.poll(() => video.evaluate(element => element.paused)).toBe(true);
    await page.locator('.player-toggle').click();
    await expect.poll(() => video.evaluate(element => element.paused)).toBe(false);
    await page.locator('.motion-button').click();
    await expect(page.locator('html')).toHaveClass('motion-paused');
    await expect.poll(() => video.evaluate(element => element.paused)).toBe(true);
    await page.reload();
    await expect.poll(() => video.evaluate(element => !element.paused && element.currentTime > 0)).toBe(true);
});

test('reduced motion pauses the scene until explicitly enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass('motion-paused');
    await expect.poll(() => page.locator('.tea-animation').evaluate(element => element.paused)).toBe(true);
    await page.locator('.player-toggle').click();
    await expect.poll(() => page.locator('.tea-animation').evaluate(element => element.paused)).toBe(false);
});

test('images and media load without browser errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto('/');
    await page.locator('.read-file').click();
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect.poll(() => page.locator('.tea-animation').evaluate(video => video.readyState >= 2 && video.videoWidth === 806 && video.videoHeight === 1080)).toBe(true);
    await expect.poll(() => page.locator('.background-music').evaluate(audio => audio.readyState >= 2 && !audio.error)).toBe(true);
    expect(errors).toEqual([]);
});
