const symbols = ['Pluma', 'Libro', 'Llave', 'Mariposa'];
const slots = [...document.querySelectorAll('.contract-slot')];
const submit = document.querySelector('.game-submit');
const reset = document.querySelector('.game-reset');
const score = document.querySelector('.game-score');
const message = document.querySelector('.game-message');
const history = document.querySelector('.contract-history');
let secret;
let attempts;
let finished;

function resetGame() {
    const available = [...symbols];
    secret = Array.from({ length: 3 }, () => available.splice(Math.floor(Math.random() * available.length), 1)[0]);
    attempts = 0;
    finished = false;
    slots.forEach(slot => { slot.value = ''; slot.disabled = false; });
    history.replaceChildren();
    submit.disabled = false;
    reset.disabled = false;
    reset.textContent = 'Nuevo contrato';
    score.textContent = '0 / 6 hipótesis';
    message.textContent = 'Echidna guarda tres runas distintas en un orden secreto. Cada hipótesis revelará una pista.';
}

submit.addEventListener('click', () => {
    if (finished) return;
    const guess = slots.map(slot => slot.value);
    const empty = guess.indexOf('');
    if (empty !== -1) {
        message.textContent = 'El contrato tiene tres espacios. Elige una runa en cada uno antes de probar.';
        slots[empty].focus();
        return;
    }
    if (new Set(guess).size !== 3) {
        message.textContent = 'Echidna señala una repetición: las tres runas deben ser diferentes. No pierdes ninguna hipótesis.';
        return;
    }
    attempts++;
    const exact = guess.filter((value, index) => value === secret[index]).length;
    const misplaced = guess.filter(value => secret.includes(value)).length - exact;
    const row = document.createElement('li');
    const combination = document.createElement('strong');
    const clue = document.createElement('span');
    combination.textContent = guess.join(' · ');
    clue.textContent = `${exact} en su lugar · ${misplaced} en otro lugar`;
    row.append(combination, clue);
    history.append(row);
    score.textContent = `${attempts} / 6 hipótesis`;
    history.scrollTop = history.scrollHeight;
    if (exact === 3 || attempts === 6) {
        finished = true;
        slots.forEach(slot => { slot.disabled = true; });
        submit.disabled = true;
        reset.textContent = 'Jugar otra vez';
        message.textContent = exact === 3
            ? `Contrato descifrado en ${attempts} hipótesis. Echidna sonríe: una buena pregunta siempre acerca a la respuesta.`
            : `Echidna abre el contrato: ${secret.join(' → ')}. Ahora conoce el resultado; un nuevo contrato espera otra investigación.`;
    } else {
        message.textContent = `Echidna revela la pista ${attempts}: ${exact} runas en su lugar y ${misplaced} correctas en otro lugar. Compara con las hipótesis anteriores.`;
    }
});

reset.addEventListener('click', resetGame);
resetGame();
