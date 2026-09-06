const chapterNames = ['profile', 'secrets', 'tea'];
const music = document.querySelector('.background-music');
const musicButton = document.querySelector('.music-toggle');
const volumeInput = document.querySelector('.music-volume');
const volumeLevel = document.querySelector('.music-level');
let lastAudibleVolume = 0.35;

music.volume = lastAudibleVolume;
try {
    const preference = JSON.parse(localStorage.getItem('echidna-audio'));
    if (preference && Number.isFinite(preference.volume)) {
        music.volume = Math.min(1, Math.max(0, preference.volume));
        music.muted = preference.muted === true;
        if (music.volume > 0) lastAudibleVolume = music.volume;
    }
} catch {}

function updateMusicControls() {
    const silent = music.muted || music.volume === 0;
    const label = music.error ? 'Audio no disponible' : silent ? 'Activar sonido' : music.paused ? 'Activar música' : 'Silenciar música';
    musicButton.setAttribute('aria-label', label);
    musicButton.setAttribute('aria-pressed', String(silent));
    musicButton.querySelector('.music-icon').textContent = silent ? '×' : '♪';
    musicButton.querySelector('.music-label').textContent = label;
    musicButton.disabled = Boolean(music.error);
    volumeInput.disabled = Boolean(music.error);
    const volume = Math.round(music.volume * 100);
    volumeInput.value = String(volume);
    volumeInput.setAttribute('aria-valuetext', `${volume} %`);
    volumeLevel.textContent = `${volume} %`;
}

function playMusic() {
    if (!music.error) music.play().catch(updateMusicControls);
}

function saveMusicPreference() {
    try {
        localStorage.setItem('echidna-audio', JSON.stringify({ volume: music.volume, muted: music.muted }));
    } catch {}
}

musicButton.addEventListener('click', () => {
    if (music.muted || music.volume === 0) {
        music.muted = false;
        if (music.volume === 0) music.volume = lastAudibleVolume;
    } else if (!music.paused) {
        music.muted = true;
    }
    playMusic();
    updateMusicControls();
    saveMusicPreference();
});
volumeInput.addEventListener('input', () => {
    music.volume = Number(volumeInput.value) / 100;
    music.muted = music.volume === 0;
    if (music.volume > 0) lastAudibleVolume = music.volume;
    playMusic();
    updateMusicControls();
    saveMusicPreference();
});
['play', 'pause', 'volumechange', 'error'].forEach((event) => music.addEventListener(event, updateMusicControls));
function startMusicOnInteraction(event) {
    if (event.target.closest('.music-controls') || music.muted || music.volume === 0) return;
    if (music.paused) playMusic();
}
document.addEventListener('click', startMusicOnInteraction);
document.addEventListener('keydown', (event) => {
    if (['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) startMusicOnInteraction(event);
});
updateMusicControls();
playMusic();

const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
const chapterPanels = [...document.querySelectorAll('.chapter-panel')];
let activeChapter = 0;

function selectChapter(name) {
    activeChapter = chapterNames.indexOf(name);
    chapterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.chapter === name)));
    chapterPanels.forEach((panel) => { panel.hidden = panel.id !== `${name}-panel`; });
    document.querySelector('.chapter-indicator').firstChild.textContent = `0${activeChapter + 1} `;
    if (window.innerWidth < 768) {
        document.querySelector('.chapter-panels').scrollIntoView({ block: 'center', behavior: motionPaused || motionPreference.matches ? 'instant' : 'smooth' });
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

const secrets = [
    ['El conocimiento es su tesoro.', 'Su avaricia no busca oro: Echidna quiere conocer cada fenómeno del mundo. Para ella, una respuesta siempre deja espacio para otra pregunta.'],
    ['Blanco, negro y una mariposa.', 'Su cabello blanco y su vestido negro dibujan una silueta inconfundible. El pequeño adorno de mariposa pone el detalle delicado en su apariencia.'],
    ['Una invitación inesperada.', 'Subaru la conoce durante el arco del Santuario, cuando es invitado a una reunión de té. La serenidad de Echidna hace todavía más misterioso aquel encuentro.'],
    ['Una voz para el misterio.', 'Maaya Sakamoto interpreta a Echidna en la versión japonesa del anime. Su voz acompaña la tranquilidad con la que la bruja conversa y plantea sus preguntas.']
];
let secretIndex = 0;

function showSecret(direction) {
    secretIndex = (secretIndex + direction + secrets.length) % secrets.length;
    document.querySelector('#secrets-title').textContent = secrets[secretIndex][0];
    document.querySelector('.secret-text').textContent = secrets[secretIndex][1];
    document.querySelector('.secret-count').textContent = `0${secretIndex + 1} / 04`;
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

let teaCount = 0;
const teaReactions = [
    'Echidna acepta la primera taza con una sonrisa. Ahora tiene toda la tarde para hacer preguntas.',
    'La segunda taza llega justo a tiempo. Echidna parece haber encontrado un tema especialmente interesante.',
    'Tres tazas y ninguna prisa. Su conversación ya ha tomado un desvío completamente inesperado.',
    'La tetera vuelve a vaciarse. Echidna sigue tan curiosa como al principio; por suerte, todavía queda té.',
    'Echidna sostiene la quinta taza entre las manos y observa cómo el vapor dibuja formas caprichosas.',
    'La sexta taza acompaña una pregunta sobre los sueños. Echidna parece dispuesta a escuchar cada detalle.',
    'Echidna deja reposar la séptima taza mientras una mariposa reclama su atención junto a la mesa.',
    'Con la octava taza, Echidna descubre que incluso elegir una galleta puede convertirse en un pequeño dilema.',
    'La novena taza enfría lentamente. Echidna está demasiado entretenida siguiendo el hilo de una nueva idea.',
    'Diez tazas después, Echidna considera que la conversación apenas está entrando en su parte interesante.',
    'Echidna gira la cucharilla y estudia el remolino de la undécima taza como si escondiera un secreto.',
    'La duodécima taza llega con una galleta. Echidna examina primero la galleta, por pura curiosidad.',
    'Echidna recibe la taza trece sin inquietarse. Le interesan mucho más las historias que rodean a ese número.',
    'Un aroma diferente despierta el interés de Echidna. La taza catorce merece una observación especialmente cuidadosa.',
    'Echidna acomoda la taza quince sobre el platillo. Hasta el pequeño tintineo parece darle otra idea.',
    'La taza dieciséis interrumpe una explicación. Echidna recuerda exactamente dónde la dejó y continúa sin dificultad.',
    'Echidna mira el fondo de la taza diecisiete. Todavía queda un sorbo y, al parecer, otra pregunta.',
    'La taza dieciocho llega mientras Echidna compara dos respuestas que parecían iguales, pero quizá no lo sean.',
    'Echidna reserva la última galleta junto a la taza diecinueve. Algunas decisiones pueden esperar un poco.',
    'Veinte tazas convierten la merienda en una larga visita. Echidna parece encantada con el cambio de planes.',
    'Echidna propone imaginar un mundo sin preguntas. La taza veintiuno acompaña un silencio bastante breve.',
    'La taza veintidós trae una pausa para observar las nubes. Echidna encuentra figuras donde antes solo había vapor.',
    'Echidna ordena los platillos junto a la taza veintitrés. La simetría dura hasta que llega otra galleta.',
    'La taza veinticuatro tiene un aroma familiar. Echidna intenta recordar qué conversación lo acompañó la última vez.',
    'Echidna celebra las veinticinco tazas levantando el meñique. Su siguiente pregunta resulta considerablemente menos ceremonial.',
    'Con la taza veintiséis, Echidna cambia de tema hacia los recuerdos que aparecen sin ser llamados.',
    'Echidna escucha una historia junto a la taza veintisiete. Su sonrisa sugiere que ya ha encontrado una contradicción.',
    'La taza veintiocho dibuja un círculo sobre la mesa. Echidna lo observa antes de acercar una servilleta.',
    'Echidna divide una galleta junto a la taza veintinueve. Las dos mitades no parecen igualmente convincentes.',
    'Treinta tazas y una tetera muy ocupada. Echidna concede que la hospitalidad también exige cierta constancia.',
    'Echidna recibe la taza treinta y una mientras contempla la diferencia entre conocer algo y comprenderlo.',
    'La taza treinta y dos acompaña una pregunta sobre los nombres. Echidna parece interesada en cómo empiezan las historias.',
    'Echidna observa una hoja de té junto a la taza treinta y tres. Un detalle pequeño puede abrir un tema enorme.',
    'La taza treinta y cuatro llega en medio de una sonrisa. Echidna acaba de encontrar una posibilidad inesperada.',
    'Echidna aparta un mechón blanco para probar la taza treinta y cinco. La conversación continúa entre sorbos.',
    'Con la taza treinta y seis, Echidna pregunta qué hace que una anécdota merezca ser contada de nuevo.',
    'Echidna contempla su reflejo en la taza treinta y siete. Una pequeña onda lo convierte en otra cosa.',
    'La taza treinta y ocho invita a una pausa. Echidna la utiliza para ordenar mentalmente varias preguntas pendientes.',
    'Echidna sostiene la taza treinta y nueve con solemnidad. La solemnidad termina cuando una mariposa pasa demasiado cerca.',
    'Cuarenta tazas después, la mesa parece una biblioteca de conversaciones. Echidna todavía encuentra espacio para otra.',
    'Echidna acerca la taza cuarenta y una. El vapor empaña por un instante su gesto de curiosidad.',
    'La taza cuarenta y dos acompaña una respuesta prometedora. Echidna la recibe como el comienzo de algo nuevo.',
    'Echidna cuenta las migas junto a la taza cuarenta y tres. Alguien ha perdido la cuenta de las galletas.',
    'Con la taza cuarenta y cuatro, Echidna considera si una pregunta puede ser más valiosa que su respuesta.',
    'Echidna elige el platillo más pequeño para la taza cuarenta y cinco. La elección requiere una explicación sorprendentemente larga.',
    'La taza cuarenta y seis espera mientras Echidna observa el recorrido de una mariposa sobre las flores.',
    'Echidna prueba la taza cuarenta y siete y levanta una ceja. El aroma ha cambiado apenas lo suficiente.',
    'La taza cuarenta y ocho acompaña una historia sobre un viaje. Echidna quiere saber qué ocurrió entre sus momentos importantes.',
    'Echidna acomoda la taza cuarenta y nueve. La mesa está lista para una cifra que merece otra galleta.',
    'Cincuenta tazas. Echidna brinda por la paciencia de su visita y por todas las preguntas que todavía faltan.',
    'La taza cincuenta y una inaugura la segunda mitad del encuentro. Echidna propone empezar con algo aparentemente sencillo.',
    'Echidna escucha con atención junto a la taza cincuenta y dos. Lo aparentemente sencillo ha dejado de serlo.',
    'Con la taza cincuenta y tres, Echidna se interesa por las cosas que las personas olvidan a propósito.',
    'Echidna observa el borde de la taza cincuenta y cuatro. Una diminuta irregularidad consigue distraerla unos segundos.',
    'La taza cincuenta y cinco llega con más galletas. Echidna considera que la investigación puede continuar en buenas condiciones.',
    'Echidna hace sitio para la taza cincuenta y seis. Su colección de preguntas ocupa bastante más que la vajilla.',
    'La taza cincuenta y siete acompaña una conversación sobre casualidades. Echidna no parece satisfecha con la primera explicación.',
    'Echidna deja la taza cincuenta y ocho en su platillo. El sonido marca una pausa perfectamente oportuna.',
    'Con la taza cincuenta y nueve, Echidna contempla la posibilidad de que el silencio también comunique algo.',
    'Sesenta tazas después, Echidna sigue recordando la primera pregunta. Las respuestas han llevado la charla bastante lejos.',
    'Echidna acerca la taza sesenta y una a las flores. Por un momento, los dos aromas parecen confundirse.',
    'La taza sesenta y dos acompaña una duda sobre el tiempo. Echidna mira la tetera, que no ofrece ninguna respuesta.',
    'Echidna compara dos galletas junto a la taza sesenta y tres. Esta vez, la investigación termina en empate.',
    'Con la taza sesenta y cuatro, Echidna se pregunta cuántas historias podrían empezar alrededor de aquella mesa.',
    'Echidna recibe la taza sesenta y cinco con un pequeño gesto de aprobación. La visita ha demostrado una perseverancia notable.',
    'La taza sesenta y seis pierde su vapor mientras Echidna imagina una respuesta que nadie había propuesto.',
    'Echidna sigue el vuelo de una mariposa junto a la taza sesenta y siete. La conversación toma otro pequeño desvío.',
    'La taza sesenta y ocho acompaña una pregunta sobre las promesas. Echidna escucha con una atención especialmente tranquila.',
    'Echidna aparta el plato de galletas para la taza sesenta y nueve. Hasta una mesa generosa tiene sus límites.',
    'Setenta tazas. Echidna mira la tetera con renovado respeto: también ella ha tenido una tarde bastante intensa.',
    'La taza setenta y una acompaña una conversación sobre las primeras impresiones. Echidna sonríe antes de escuchar la respuesta.',
    'Echidna acerca la taza setenta y dos. Una corriente de aire mueve su cabello y desordena un instante la escena.',
    'Con la taza setenta y tres, Echidna encuentra una pregunta escondida dentro de otra pregunta. La tarde gana una nueva dirección.',
    'Echidna recibe la taza setenta y cuatro mientras intenta decidir qué detalle de una historia suele pasar inadvertido.',
    'Setenta y cinco tazas merecen una pausa para las flores. Echidna observa sus colores antes de retomar la charla.',
    'La taza setenta y seis trae una conversación sobre lo imposible. Echidna parece especialmente interesada en esa palabra.',
    'Echidna da un pequeño sorbo a la taza setenta y siete. La respuesta que esperaba resulta distinta, y eso le agrada.',
    'Con la taza setenta y ocho, Echidna se interesa por los caminos que nadie llegó a tomar.',
    'Echidna deja la taza setenta y nueve junto a una servilleta doblada. El orden de la mesa vuelve a durar poco.',
    'Ochenta tazas después, Echidna considera que ya existe material suficiente para una conversación todavía más larga.',
    'La taza ochenta y una acompaña una historia incompleta. Echidna quiere conocer precisamente la parte que falta.',
    'Echidna observa el vapor de la taza ochenta y dos. Durante un segundo parece una mariposa, o quizá solo lo parece.',
    'Con la taza ochenta y tres, Echidna pregunta por esos pequeños hábitos que casi nadie sabe explicar.',
    'Echidna recibe la taza ochenta y cuatro y concede un descanso a la cucharilla. La tetera no tiene tanta suerte.',
    'La taza ochenta y cinco acompaña un recuerdo inesperado. Echidna presta atención a los detalles que lo hicieron volver.',
    'Echidna acomoda la taza ochenta y seis. La conversación regresa a un tema anterior, pero ahora tiene otro matiz.',
    'Con la taza ochenta y siete, Echidna descubre que aún queda una galleta intacta. El hallazgo merece cierta celebración.',
    'Echidna observa la taza ochenta y ocho antes de beber. Incluso después de tantas, el siguiente sorbo sigue siendo distinto.',
    'La taza ochenta y nueve acompaña una pregunta sobre la despedida. Echidna parece creer que todavía es demasiado pronto.',
    'Noventa tazas. Echidna levanta la mirada con una sonrisa: quedan pocas cifras, pero muchísimos asuntos pendientes.',
    'Echidna acepta la taza noventa y una. Su visita ya conoce bastante bien el camino entre la mesa y la tetera.',
    'La taza noventa y dos acompaña una revisión de la tarde. Echidna recuerda una respuesta que merece ser examinada otra vez.',
    'Con la taza noventa y tres, Echidna propone dejar una pregunta sin resolver. Solo una, y quizá no por mucho tiempo.',
    'Echidna sostiene la taza noventa y cuatro mientras una mariposa descansa. La mesa disfruta de un raro instante de quietud.',
    'Noventa y cinco tazas después, Echidna mira la reserva de té. La previsión ha resultado una virtud muy conveniente.',
    'Echidna recibe la taza noventa y seis con curiosidad intacta. La cantidad de respuestas nunca parece superar a la de preguntas.',
    'La taza noventa y siete acompaña una pequeña recapitulación. Echidna encuentra enseguida algo que nadie había mencionado.',
    'Echidna acerca la taza noventa y ocho. El encuentro está a una taza de completar su pequeño recorrido.',
    'Noventa y nueve tazas. Echidna agradece la compañía con una sonrisa; la siguiente tetera inaugurará una nueva ronda.'
];
document.querySelector('.pour-button').addEventListener('click', () => {
    teaCount = (teaCount + 1) % 100;
    document.querySelector('.tea-count').textContent = `${teaCount} ${teaCount === 1 ? 'taza' : 'tazas'}`;
    document.querySelector('.tea-reaction').textContent = teaCount === 0
        ? 'Echidna cambia la tetera y prepara una nueva ronda. El contador vuelve a cero; su curiosidad permanece intacta.'
        : teaReactions[teaCount - 1];
    if (!motionPaused) {
        const steam = document.createElement('span');
        steam.className = 'tea-steam';
        steam.textContent = '♨';
        steam.setAttribute('aria-hidden', 'true');
        document.querySelector('.character-stage').append(steam);
        steam.addEventListener('animationend', () => steam.remove(), { once: true });
        window.setTimeout(() => steam.remove(), 1800);
    }
});

const dialog = document.querySelector('.character-dialog');
document.querySelectorAll('[data-open-file]').forEach((button) => button.addEventListener('click', () => dialog.showModal()));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});

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

const characterStage = document.querySelector('.character-stage');
characterStage.addEventListener('pointermove', (event) => {
    if (motionPaused || event.pointerType !== 'mouse') return;
    const bounds = characterStage.getBoundingClientRect();
    characterStage.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 7}px`);
    characterStage.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 5}px`);
});
characterStage.addEventListener('pointerleave', () => {
    characterStage.style.setProperty('--pointer-x', '0px');
    characterStage.style.setProperty('--pointer-y', '0px');
});
