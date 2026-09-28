const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-button');
const playerButton = document.querySelector('.player-toggle');
const animationVideo = document.querySelector('.tea-animation');
let motionPaused = motionPreference.matches;
let resumeWhenVisible = false;

function updatePlayer() {
    const animationPlaying = !animationVideo.paused;
    playerButton.setAttribute('aria-pressed', String(animationPlaying));
    playerButton.setAttribute('aria-label', animationPlaying ? 'Pausar escena animada' : 'Reproducir escena animada');
    playerButton.querySelector('.player-icon').textContent = animationPlaying ? 'Ⅱ' : '▷';
    playerButton.querySelector('.player-label').textContent = animationPlaying ? 'Pausar escena' : 'Reproducir escena';
}
animationVideo.addEventListener('play', updatePlayer);
animationVideo.addEventListener('pause', updatePlayer);
animationVideo.muted = true;

function setPlayback(playing) {
    if (playing) animationVideo.play().catch(updatePlayer);
    else animationVideo.pause();
    updatePlayer();
}

function updateMotion() {
    animationVideo.autoplay = !motionPaused;
    document.documentElement.classList.toggle('motion-paused', motionPaused);
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.setAttribute('aria-label', motionPaused ? 'Activar animaciones' : 'Pausar animaciones');
    motionButton.querySelector('span').textContent = motionPaused ? '▷' : 'Ⅱ';
    motionButton.querySelector('.motion-label').textContent = motionPaused ? 'En pausa' : 'En movimiento';
    setPlayback(!motionPaused && !document.hidden);
}
updateMotion();

motionButton.addEventListener('click', () => {
    motionPaused = !motionPaused;
    updateMotion();
});
motionPreference.addEventListener('change', () => {
    motionPaused = motionPreference.matches;
    updateMotion();
});
playerButton.addEventListener('click', () => {
    if (motionPaused) {
        motionPaused = false;
        updateMotion();
    } else {
        setPlayback(animationVideo.paused);
    }
});
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        resumeWhenVisible = !animationVideo.paused;
        setPlayback(false);
    } else if (resumeWhenVisible && !motionPaused) {
        setPlayback(true);
    }
});

export function isMotionPaused() { return motionPaused; }
