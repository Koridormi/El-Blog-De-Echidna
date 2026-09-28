import { isMotionPaused } from './scene-player.js';
import './music.js';
import './characters/echidna-game.js';

const chapterNames = ['profile', 'secrets', 'tea'];
const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
const chapterPanels = [...document.querySelectorAll('.chapter-panel')];
let activeChapter = 0;

function selectChapter(name) {
    activeChapter = chapterNames.indexOf(name);
    chapterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.chapter === name)));
    chapterPanels.forEach((panel) => { panel.hidden = panel.id !== `${name}-panel`; });
    document.querySelector('.chapter-indicator').firstChild.textContent = `0${activeChapter + 1} `;
    if (window.innerWidth < 768) {
        document.querySelector('.chapter-panels').scrollIntoView({ block: 'center', behavior: isMotionPaused() ? 'instant' : 'smooth' });
    }
}

chapterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        selectChapter(button.dataset.chapter);
    });
});
document.querySelector('.next-chapter').addEventListener('click', () => {
    selectChapter(chapterNames[(activeChapter + 1) % chapterNames.length]);
});

const themes = ['lilac', 'ice', 'mint'];
const themeButtons = [...document.querySelectorAll('.swatch')];

function setTheme(theme) {
    if (!themes.includes(theme)) return;
    document.body.dataset.theme = theme;
    themeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
}

try {
    const savedTheme = localStorage.getItem('echidna-theme');
    setTheme(savedTheme === 'rose' ? 'ice' : savedTheme);
} catch {}
themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setTheme(button.dataset.theme);
        try { localStorage.setItem('echidna-theme', button.dataset.theme); } catch {}
    });
});

const secrets = [...document.querySelectorAll('.profile-curiosities details')];
let secretIndex = 0;

function showSecret(direction) {
    secretIndex = (secretIndex + direction + secrets.length) % secrets.length;
    document.querySelector('#secrets-title').textContent = secrets[secretIndex].querySelector('summary').textContent;
    document.querySelector('.secret-text').textContent = secrets[secretIndex].querySelector('p').textContent;
    document.querySelector('.secret-count').textContent = String(secretIndex + 1).padStart(2, '0') + ' / ' + String(secrets.length).padStart(2, '0');
}
document.querySelector('.secret-prev').addEventListener('click', () => showSecret(-1));
document.querySelector('.secret-next').addEventListener('click', () => showSecret(1));

const thoughts = [
    'Echidna ya tiene otra pregunta. Naturalmente.',
    'Una mariposa ha interrumpido sus pensamientos. Por un instante.',
    'El té puede enfriarse. Su curiosidad, nunca.',
    'Echidna parece satisfecha… hasta que descubre algo que todavía no sabe.'
];
let thoughtIndex = 0;
const thoughtNote = document.querySelector('.butterfly-note');
document.querySelector('.butterfly-button').addEventListener('click', () => {
    thoughtNote.hidden = false;
    thoughtNote.textContent = thoughts[thoughtIndex++ % thoughts.length];
});
document.addEventListener('click', (event) => {
    if (!event.target.closest('.butterfly-button, .butterfly-note')) thoughtNote.hidden = true;
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') thoughtNote.hidden = true;
});

const dialog = document.querySelector('.character-dialog');
document.querySelectorAll('[data-open-file]').forEach((button) => button.addEventListener('click', () => dialog.showModal()));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});

const characterStage = document.querySelector('.character-stage');
characterStage.addEventListener('pointermove', (event) => {
    if (isMotionPaused() || event.pointerType !== 'mouse') return;
    const bounds = characterStage.getBoundingClientRect();
    characterStage.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 7}px`);
    characterStage.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 5}px`);
});
characterStage.addEventListener('pointerleave', () => {
    characterStage.style.setProperty('--pointer-x', '0px');
    characterStage.style.setProperty('--pointer-y', '0px');
});
