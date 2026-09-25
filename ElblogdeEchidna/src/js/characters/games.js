const character = document.body.dataset.character;
const board = document.querySelector('.game-board');
const task = document.querySelector('.game-task');
const message = document.querySelector('.game-message');
const score = document.querySelector('.game-score');
const reset = document.querySelector('.game-reset');
const assist = document.querySelector('.game-assist');
const submit = document.querySelector('.game-submit');
const tray = document.querySelector('.game-tray');
let state;

function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
}

function createButtons(labels) {
    board.replaceChildren(...labels.map((label, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'game-action';
        button.dataset.choice = String(index);
        button.textContent = label;
        return button;
    }));
}

function complete(text) {
    state.finished = true;
    task.textContent = text;
    board.querySelectorAll('button').forEach(button => { button.disabled = true; });
    assist.disabled = true;
    submit.disabled = true;
    reset.textContent = 'Jugar otra vez';
}

const crystals = ['Estrella', 'Flor', 'Luna', 'Rombo'];
const crystalShapes = ['M12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8Z', 'M12 9C3-2 0 12 9 12 0 22 16 25 12 15 24 24 28 9 15 12 24 0 9-2 12 9Z', 'M16 3A9 9 0 1 0 21 17 10 10 0 0 1 16 3Z', 'M12 2 21 12 12 22 3 12Z'];

function renderCrystals() {
    board.querySelectorAll('button').forEach((button, index) => {
        const revealed = state.matched.includes(index) || state.open.includes(index);
        const value = state.deck[index];
        button.innerHTML = revealed ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${crystalShapes[value]}" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span>${crystals[value]}</span>` : `<span class="crystal-back" aria-hidden="true">◇</span><span>Cristal ${index + 1}</span>`;
        button.setAttribute('aria-label', revealed ? `${crystals[value]}, cristal ${index + 1}${state.matched.includes(index) ? ', pareja encontrada' : ''}` : `Descubrir cristal ${index + 1}`);
        button.classList.toggle('is-revealed', revealed);
        button.classList.toggle('is-matched', state.matched.includes(index));
        button.disabled = state.matched.includes(index);
    });
    score.textContent = `${state.matched.length / 2} / 4 parejas · ${state.turns} intentos`;
    assist.disabled = state.open.length !== 2;
}

function chooseCrystal(index) {
    if (state.open.length === 2) state.open = [];
    if (state.open.includes(index)) return;
    state.open.push(index);
    if (state.open.length === 2) {
        state.turns++;
        if (state.deck[state.open[0]] === state.deck[index]) {
            state.matched.push(...state.open);
            state.open = [];
            message.textContent = `Emilia reúne la pareja de ${crystals[state.deck[index]].toLowerCase()}. ${state.matched.length / 2} parejas brillan juntas.`;
        } else message.textContent = 'Emilia conserva ambos cristales a la vista. Recuerda sus lugares; el siguiente clic los cubrirá.';
    } else message.textContent = 'Emilia observa la forma. Ahora falta encontrar su pareja.';
    renderCrystals();
    if (state.matched.length === 8) complete(`Constelación completa en ${state.turns} intentos.`);
}

const ingredients = ['Masa', 'Fresa', 'Crema', 'Chocolate'];
const recipes = [
    { name: 'Tarta de fresas', items: [0, 2, 1] },
    { name: 'Galleta de chocolate', items: [0, 3] },
    { name: 'Fresas con crema', items: [1, 2] },
    { name: 'Tarta de chocolate', items: [0, 3, 2] },
    { name: 'Fresa bañada', items: [1, 3] },
];

function renderKitchen() {
    const recipe = state.orders[state.served];
    task.textContent = `Pedido ${state.served + 1}: ${recipe.name}. Orden: ${recipe.items.map(item => ingredients[item]).join(' → ')}.`;
    tray.textContent = state.tray.length ? 'Tu bandeja: ' + state.tray.map(item => ingredients[item]).join(' → ') : 'Tu bandeja está vacía.';
    score.textContent = `${state.served} / 3 pedidos · ${state.mistakes} correcciones`;
    assist.disabled = state.tray.length === 0;
    submit.disabled = state.tray.length === 0;
    board.querySelectorAll('button').forEach(button => { button.disabled = state.tray.length === 3; });
}

function serveOrder() {
    if (state.tray.join() !== state.orders[state.served].items.join()) {
        state.mistakes++;
        message.textContent = 'Rem compara la bandeja con el pedido. Retira el último ingrediente o vacíala para corregir el orden.';
        renderKitchen();
        return;
    }
    const name = state.orders[state.served].name;
    state.served++;
    state.tray = [];
    message.textContent = `Rem sirve ${name.toLowerCase()}. ${state.served === 3 ? 'La merienda está lista; agradece la ayuda con una sonrisa.' : 'El siguiente pedido ya espera en la cocina.'}`;
    if (state.served === 3) {
        score.textContent = `3 / 3 pedidos · ${state.mistakes} correcciones`;
        tray.textContent = 'Las tres bandejas están servidas.';
        complete('Servicio completo. ¡Buen trabajo en la cocina!');
    } else renderKitchen();
}

function gust(index, leaves) {
    for (let cell = 0; cell < 9; cell++) {
        if (Math.abs(Math.floor(cell / 3) - Math.floor(index / 3)) + Math.abs(cell % 3 - index % 3) <= 1) leaves[cell] = !leaves[cell];
    }
}

function startGarden() {
    state.leaves = Array(9).fill(false);
    shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, state.round + 1).forEach(index => gust(index, state.leaves));
    state.history = [];
    state.cleared = false;
    task.textContent = 'Una ráfaga invierte la casilla y sus vecinas en cruz. Deja todo el sendero sin hojas.';
    renderGarden();
}

function renderGarden() {
    board.querySelectorAll('button').forEach((button, index) => {
        const leaf = state.leaves[index];
        button.innerHTML = leaf ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20C-1 6 12 2 21 3c0 10-5 19-17 17Zm0 0L17 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span>Hoja</span>' : '<span class="garden-clear" aria-hidden="true">·</span><span>Libre</span>';
        button.setAttribute('aria-label', `Fila ${Math.floor(index / 3) + 1}, columna ${index % 3 + 1}: ${leaf ? 'hoja' : 'libre'}`);
        button.setAttribute('aria-pressed', String(leaf));
        button.disabled = state.cleared;
    });
    score.textContent = `Sendero ${state.round} / 3 · ${state.moves} ráfagas`;
    assist.disabled = state.history.length === 0 || state.cleared;
    submit.disabled = !state.cleared;
}

function resetGame() {
    reset.textContent = 'Empezar de nuevo';
    submit.hidden = character === 'emilia';
    tray.hidden = character !== 'rem';
    if (character === 'emilia') {
        state = { deck: shuffle([0, 0, 1, 1, 2, 2, 3, 3]), open: [], matched: [], turns: 0 };
        createButtons(Array(8).fill('Cristal'));
        task.textContent = 'Encuentra cuatro parejas de cristales. Cada partida cambia sus lugares.';
        message.textContent = 'Emilia cubre los cristales. La memoria iluminará esta pequeña constelación.';
        assist.textContent = 'Cubrir cristales';
        renderCrystals();
    } else if (character === 'rem') {
        state = { orders: shuffle(recipes).slice(0, 3), tray: [], served: 0, mistakes: 0 };
        createButtons(ingredients);
        assist.textContent = 'Retirar último';
        submit.textContent = 'Servir pedido';
        message.textContent = 'Rem recibe tres pedidos distintos. Prepara cada bandeja en el orden indicado.';
        renderKitchen();
    } else {
        state = { round: 1, moves: 0, history: [], leaves: [] };
        createButtons(Array(9).fill('Sendero'));
        assist.textContent = 'Deshacer ráfaga';
        submit.textContent = 'Siguiente sendero';
        message.textContent = 'Ram espera un jardín impecable. Cada ráfaga despeja hojas, pero también puede traerlas de vuelta.';
        startGarden();
    }
}

board.addEventListener('click', event => {
    const button = event.target.closest('.game-action');
    if (!button || button.disabled || state.finished) return;
    const index = Number(button.dataset.choice);
    if (character === 'emilia') chooseCrystal(index);
    else if (character === 'rem') {
        state.tray.push(index);
        message.textContent = `Rem coloca ${ingredients[index].toLowerCase()} en la posición ${state.tray.length}.`;
        renderKitchen();
    } else {
        state.history.push([...state.leaves]);
        gust(index, state.leaves);
        state.moves++;
        state.cleared = state.leaves.every(leaf => !leaf);
        message.textContent = state.cleared ? 'Ram inspecciona el sendero. Ni una hoja: concede un gesto de aprobación.' : `Ram observa la ráfaga. Quedan ${state.leaves.filter(Boolean).length} casillas con hojas.`;
        renderGarden();
        if (state.cleared && state.round === 3) complete('Tres senderos impecables. Ram aprueba la inspección.');
    }
});

assist.addEventListener('click', () => {
    if (character === 'emilia') { state.open = []; renderCrystals(); }
    else if (character === 'rem') { state.tray.pop(); renderKitchen(); }
    else { state.leaves = state.history.pop(); state.moves--; renderGarden(); }
    message.textContent = 'Todo listo para intentarlo de nuevo.';
});
submit.addEventListener('click', () => {
    if (character === 'rem') serveOrder();
    else { state.round++; startGarden(); message.textContent = 'Ram señala otro sendero. El viento plantea un nuevo desafío.'; }
});
reset.disabled = false;
reset.addEventListener('click', resetGame);
resetGame();
