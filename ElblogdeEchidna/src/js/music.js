const music = document.querySelector('.background-music');
const button = document.querySelector('.music-toggle');
const volumeInput = document.querySelector('.music-volume');
const volumeLevel = document.querySelector('.music-level');
const preferenceKey = 'echidna-audio';
let preference = { enabled: false, muted: false, volume: 0.35, lastVolume: 0.35 };

function readPreference(value) {
    try {
        const saved = JSON.parse(value);
        if (!saved || !Number.isFinite(saved.volume)) return;
        preference = {
            enabled: saved.enabled === true,
            muted: saved.muted === true,
            volume: Math.min(1, Math.max(0, saved.volume)),
            lastVolume: Number.isFinite(saved.lastVolume) && saved.lastVolume > 0 ? Math.min(1, saved.lastVolume) : 0.35,
        };
    } catch {}
}

function updateControls() {
    const silent = preference.muted || preference.volume === 0;
    const label = music.error ? 'Audio no disponible' : music.paused ? 'Activar música' : 'Silenciar música';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(silent));
    button.querySelector('.music-icon').textContent = silent ? '×' : '♪';
    button.querySelector('.music-label').textContent = label;
    button.disabled = Boolean(music.error);
    volumeInput.disabled = Boolean(music.error);
    const volume = Math.round(preference.volume * 100);
    volumeInput.value = String(volume);
    volumeInput.setAttribute('aria-valuetext', `${volume} %`);
    volumeLevel.textContent = `${volume} %`;
}

function applyPreference() {
    music.volume = preference.volume;
    music.muted = preference.muted;
    if (preference.enabled && !preference.muted && preference.volume > 0 && !music.error) {
        music.play().catch(updateControls);
    } else {
        music.pause();
    }
    updateControls();
}

function savePreference() {
    try { localStorage.setItem(preferenceKey, JSON.stringify(preference)); } catch {}
    applyPreference();
}

button.addEventListener('click', () => {
    if (music.paused || preference.muted || preference.volume === 0) {
        preference.enabled = true;
        preference.muted = false;
        if (preference.volume === 0) preference.volume = preference.lastVolume;
    } else {
        preference.muted = true;
    }
    savePreference();
});

volumeInput.addEventListener('input', () => {
    preference.volume = Number(volumeInput.value) / 100;
    preference.muted = preference.volume === 0;
    if (preference.volume > 0) preference.lastVolume = preference.volume;
    savePreference();
});

window.addEventListener('storage', event => {
    if (event.key !== preferenceKey) return;
    if (event.newValue === null) preference = { enabled: false, muted: false, volume: 0.35, lastVolume: 0.35 };
    else readPreference(event.newValue);
    applyPreference();
});

window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem('echidna-audio-position', String(music.currentTime)); } catch {}
    music.pause();
});
window.addEventListener('pageshow', () => {
    try { readPreference(localStorage.getItem(preferenceKey)); } catch {}
    applyPreference();
});
function restorePosition() {
    try {
        const position = Number(sessionStorage.getItem('echidna-audio-position'));
        if (Number.isFinite(position) && position > 0 && Number.isFinite(music.duration)) music.currentTime = position % music.duration;
    } catch {}
}
music.addEventListener('loadedmetadata', restorePosition, { once: true });
if (music.readyState >= 1) restorePosition();
['play', 'pause', 'volumechange', 'error'].forEach(event => music.addEventListener(event, updateControls));
try { readPreference(localStorage.getItem(preferenceKey)); } catch {}
applyPreference();
