import { test, expect } from '@playwright/test';

async function openGame(page, character) {
    await page.goto(`/pages/characters/${character}.html`);
    await page.locator('.chapter-nav [data-chapter="tea"]').click();
}

test('Emilia: discover, remember, match and reset crystals', async ({ page }) => {
    await openGame(page, 'emilia');
    const cards = page.locator('.game-action');
    const pairs = new Map();
    for (let index = 0; index < 8; index++) {
        await cards.nth(index).click();
        const name = await cards.nth(index).locator('span').textContent();
        pairs.set(name, [...(pairs.get(name) || []), index]);
    }
    expect(pairs.size).toBe(4);
    for (const indices of pairs.values()) expect(indices).toHaveLength(2);
    if (await page.locator('.game-assist').isEnabled()) await page.locator('.game-assist').click();
    for (const indices of pairs.values()) {
        if (await cards.nth(indices[0]).isDisabled()) continue;
        await cards.nth(indices[0]).click();
        await cards.nth(indices[1]).click();
        await expect(cards.nth(indices[0])).toBeDisabled();
        await expect(cards.nth(indices[1])).toBeDisabled();
    }
    await expect(page.locator('.game-score')).toContainText('4 / 4 parejas');
    await expect(page.locator('.game-task')).toContainText('Constelación completa');
    await page.getByRole('button', { name: 'Jugar otra vez' }).click();
    await expect(page.locator('.game-score')).toHaveText('0 / 4 parejas · 0 intentos');
    await expect(page.locator('.is-revealed')).toHaveCount(0);
    for (const card of await cards.all()) await expect(card).toBeEnabled();
});

test('Rem: incorrect orders can be corrected, three different recipes and reset', async ({ page }) => {
    await openGame(page, 'rem');
    await page.locator('.game-action').getByText('Chocolate', { exact: true }).click();
    await page.locator('.game-submit').click();
    await expect(page.locator('.game-score')).toHaveText('0 / 3 pedidos · 1 correcciones');
    await page.locator('.game-assist').click();
    await expect(page.locator('.game-tray')).toHaveText('Tu bandeja está vacía.');
    const orders = new Set();
    for (let order = 0; order < 3; order++) {
        const task = await page.locator('.game-task').textContent();
        orders.add(task.split('. Orden:')[0].replace(/Pedido \d: /, ''));
        const ingredients = task.split('Orden: ')[1].slice(0, -1).split(' → ');
        for (const name of ingredients) await page.getByRole('button', { name, exact: true }).click();
        await page.locator('.game-submit').click();
        await expect(page.locator('.game-score')).toContainText(`${order + 1} / 3 pedidos`);
    }
    expect(orders.size).toBe(3);
    await expect(page.locator('.game-task')).toContainText('Servicio completo');
    await expect(page.locator('.game-submit')).toBeDisabled();
    await page.getByRole('button', { name: 'Jugar otra vez' }).click();
    await expect(page.locator('.game-score')).toHaveText('0 / 3 pedidos · 0 correcciones');
    await expect(page.locator('.game-tray')).toHaveText('Tu bandeja está vacía.');
});

test('Ram: cross-shaped gusts, undo, three solvable gardens and reset', async ({ page }) => {
    await openGame(page, 'ram');
    const cells = page.locator('.game-action');
    const read = () => cells.evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-pressed') === 'true'));
    const initial = await read();
    await cells.nth(4).click();
    const changed = await read();
    expect(changed.map((value, index) => value !== initial[index])).toEqual([false, true, false, true, true, true, false, true, false]);
    await page.locator('.game-assist').click();
    expect(await read()).toEqual(initial);
    for (let round = 1; round <= 3; round++) {
        const leaves = await read();
        expect(leaves.some(Boolean)).toBe(true);
        let solution;
        for (let mask = 1; mask < 512; mask++) {
            const result = [...leaves];
            for (let index = 0; index < 9; index++) {
                if (!(mask & (1 << index))) continue;
                for (let cell = 0; cell < 9; cell++) {
                    if (Math.abs(Math.floor(cell / 3) - Math.floor(index / 3)) + Math.abs(cell % 3 - index % 3) <= 1) result[cell] = !result[cell];
                }
            }
            if (result.every(value => !value)) { solution = mask; break; }
        }
        expect(solution).toBeDefined();
        for (let index = 0; index < 9; index++) if (solution & (1 << index)) await cells.nth(index).click();
        expect((await read()).every(value => !value)).toBe(true);
        if (round < 3) await page.locator('.game-submit').click();
    }
    await expect(page.locator('.game-task')).toContainText('Ram aprueba');
    await page.getByRole('button', { name: 'Jugar otra vez' }).click();
    await expect(page.locator('.game-score')).toHaveText('Sendero 1 / 3 · 0 ráfagas');
    for (const cell of await cells.all()) await expect(cell).toBeEnabled();
});

test('all dossiers share structure and games fit every existing breakpoint', async ({ page }) => {
    let template;
    for (const character of ['echidna', 'emilia', 'rem', 'ram']) {
        await page.goto(character === 'echidna' ? '/' : `/pages/characters/${character}.html`);
        await expect(page.locator('.chapter-panel')).toHaveCount(3);
        await expect(page.locator('.memory-card')).toHaveCount(2);
        await page.locator('.read-file').click();
        const structure = await page.locator('dialog').evaluate(dialog => [...dialog.children].map(child => `${child.tagName}.${child.className}`));
        if (!template) template = structure;
        expect(structure).toEqual(template);
        await expect(page.locator('dialog dd')).toHaveCount(4);
        await expect(page.locator('dialog details')).toHaveCount(6);
        await page.locator('dialog > img').evaluate(image => image.decode());
        await expect.poll(() => page.locator('dialog > img').evaluate(image => image.naturalWidth)).toBe(1536);
        await page.keyboard.press('Escape');
        await page.locator('.chapter-nav [data-chapter="tea"]').click();
        for (const width of [375, 767, 768, 1023, 1024, 1199, 1200, 1399, 1400]) {
            await page.setViewportSize({ width, height: 900 });
            const dimensions = await page.evaluate(() => {
                const board = document.querySelector('.game-board');
                return { viewport: innerWidth, page: document.documentElement.scrollWidth, board: board.scrollWidth, available: board.clientWidth };
            });
            expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
            expect(dimensions.board).toBeLessThanOrEqual(dimensions.available);
        }
    }
});
