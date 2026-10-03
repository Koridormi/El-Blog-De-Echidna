# Re:Zero Fan Space

Fan site de **Echidna, Emilia, Rem y Ram**, construido con HTML, JavaScript nativo, SCSS y Vite. Echidna es la página de inicio; los enlaces entre personajes funcionan también sin JavaScript.

[Visitar el sitio oficial](https://echidna-blog.netlify.app/)

![Perfil de Echidna en escritorio](media/echidna-desktop.png)

## Explorar y jugar

Cada perfil comparte tres capítulos, seis curiosidades, un expediente ilustrado, las mismas tres paletas (lavanda, azul hielo y rosa empolvado) y controles de movimiento y música. Echidna y Emilia comienzan en lavanda, Rem en azul hielo y Ram en rosa empolvado. La selección del visitante se recuerda por personaje y tiene prioridad sobre el ambiente predeterminado.

| Personaje | Juego |
| --- | --- |
| Echidna | **El contrato de las tres runas**: deduce un orden secreto con pistas y hasta seis hipótesis. |
| Emilia | **La memoria del hielo**: encuentra cuatro parejas en un tablero que cambia en cada partida. |
| Rem | **La cocina de los pedidos**: prepara tres recetas distintas, ordena los ingredientes y corrige las bandejas. |
| Ram | **El acertijo del viento**: despeja tres senderos con ráfagas en cruz y opción de deshacer. |

Los juegos no tienen límite de tiempo y permiten reiniciar. Sus reglas y mensajes son creaciones del fan site, no contenido canónico del anime.

Los cuatro perfiles comparten la misma música, que requiere una primera activación explícita desde **Activar música**. Después conserva activación, silencio y volumen entre personajes y pestañas; recupera la posición al navegar en la misma pestaña. Si el navegador bloquea la reanudación, el botón permite iniciarla de nuevo. Los temas y las preferencias de audio utilizan `localStorage`; la posición del audio utiliza `sessionStorage`.

Los cuatro personajes tienen escenas animadas sin sonido. Se reproducen automáticamente salvo con movimiento reducido y pueden pausarse o reanudarse desde la página. Al ocultar la pestaña, el reproductor detiene la escena; al volver, solo reanuda si estaba reproduciéndose. Los GIF están en `media/animations/`; la web sirve versiones WebM de 806 × 1080 con póster WebP para reducir el peso y controlar la reproducción.

- [Echidna: té al atardecer, mariposa y jardín](media/animations/echidna-scene.gif).
- [Emilia: cristales y nieve](media/animations/emilia-scene.gif).
- [Rem: mariposa luminosa y jardín bajo la luna](media/animations/rem-moonlit-garden.gif).
- [Ram: viento y hojas](media/animations/ram-scene.gif).

Echidna, Emilia y Rem tienen ilustraciones creadas para sus escenas; Ram reutiliza su ilustración de jardín con animación propia. La escena de Rem conserva el rostro sin deformaciones y anima por separado la mariposa, las luces, los pétalos y los reflejos de la fuente.

[Ver el juego de Echidna en móvil](media/echidna-contract-mobile.png)

## Desarrollo

Se recomienda **Node.js 22.12 o posterior** con npm. Vite también admite Node.js 20 a partir de 20.19. Desde la raíz del repositorio:

```bash
cd ElblogdeEchidna
npm ci
npm run dev
```

Abre [http://127.0.0.1:5173](http://127.0.0.1:5173). No se necesitan claves API ni cuentas.

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Servidor local en el puerto 5173. |
| `npm run build` | Compila las cuatro páginas en `dist/`. |
| `npm run preview` | Sirve la compilación en local. |
| `npm test` | Ejecuta la suite completa de Playwright. |
| `npx playwright test` | Ejecuta la suite completa. |
| `npx playwright test --workers=1` | Ejecuta las mismas pruebas en serie para equipos con recursos limitados. |

Si falta el navegador de pruebas, se instala con `npx playwright install chromium`. Todos estos comandos se ejecutan desde `ElblogdeEchidna/`.

## Validación y accesibilidad

La suite contiene **40 pruebas en siete archivos** que cubren juegos, victoria y reinicio, curiosidades, navegación, estructura de expedientes, metadatos, canónicas, sitemap, carga de recursos, audio, animación y teclado. Se comprueban 375, 767, 768, 1023, 1024, 1199, 1200, 1399 y 1400 px. La cobertura de audio contempla la recuperación mediante el botón cuando el navegador bloquea la reproducción tras recargar.

La interfaz incluye enlace para saltar al contenido, controles etiquetados, foco visible, mensajes de juego anunciados, imágenes con alternativas textuales, cierre de expedientes con Escape y respeto por movimiento reducido. Estas comprobaciones son una revisión básica, no una certificación completa de accesibilidad.

Playwright inicia o reutiliza el servidor de `playwright.config.js`. Capturas de fallos y trazas quedan en `test-results/`, fuera de Git.

## Estructura

```text
El-Blog-Echidna/
├── ElblogdeEchidna/
│   ├── index.html                  # Perfil de Echidna
│   ├── pages/characters/           # Emilia, Rem y Ram
│   ├── public/                    # Icono, robots.txt, sitemap.xml e imágenes sociales
│   ├── src/
│   │   ├── assets/
│   │   │   ├── audio/             # Música compartida
│   │   │   ├── images/            # Ilustraciones y póster de Echidna
│   │   │   ├── characters/        # Ilustraciones, pósteres y videos por personaje
│   │   │   └── videos/            # Escena WebM de Echidna
│   │   ├── js/
│   │   │   ├── main.js            # Interacciones de Echidna
│   │   │   ├── music.js           # Audio y preferencias compartidas
│   │   │   ├── scene-player.js    # Reproducción y controles de movimiento
│   │   │   └── characters/        # Perfiles y juegos de los cuatro personajes
│   │   └── scss/                 # Plantilla común y ajustes de personajes
│   ├── tests/
│   ├── vite.config.js             # Entradas de las cuatro páginas
│   └── playwright.config.js
├── media/                        # Capturas y GIF de este README
├── profiles/                     # Referencias y fuentes locales; ignorado por Git
└── README.md
```

Los retratos `*-character.webp` conservan transparencia; `*-curiosities-card.webp`, `*-game-card.webp`, `echidna-contract-card.webp` y `*-dossier-scene.webp` tienen fondos ilustrados. Los prompts de generación se guardan junto a los recursos creados. Las referencias para avatares y banners de Echidna están en `profiles/Echidna/`; las fuentes y scripts de las escenas están en `profiles/CharacterScenes/`. Como `profiles/` está ignorado por Git, estas carpetas locales no se incluyen al clonar el repositorio. Los WebM, pósteres y GIF necesarios para la web y este README sí se conservan en el repositorio.

## SEO y publicación

El dominio oficial es [echidna-blog.netlify.app](https://echidna-blog.netlify.app/). Las cuatro páginas tienen títulos y descripciones propios, canónicas absolutas, `og:url`, metadatos Open Graph y Twitter, idioma español y datos estructurados `WebPage` con sus URL definitivas.

`public/social/` contiene las imágenes sociales JPEG de 1200 × 800 px, optimizadas y con rutas estables. `public/robots.txt` permite el rastreo y referencia `sitemap.xml`, que incluye únicamente las cuatro páginas canónicas. Vite copia estos recursos a `dist/` al compilar. No hay dominios de ejemplo, fechas de actualización ficticias ni etiquetas de verificación pendientes.

Desde `ElblogdeEchidna/`, comprueba la compilación que vas a publicar:

```bash
npm ci
npm run build
npm run preview
```

La vista previa sirve `dist/` en [http://127.0.0.1:4173](http://127.0.0.1:4173). Comprueba también la suite con `npm test`; Playwright usa el servidor de desarrollo configurado, no el de vista previa.

En Netlify, la carpeta base es `ElblogdeEchidna`, el comando de compilación es `npm run build` y la carpeta de publicación es `dist`. No requiere un servidor de aplicación ni una base de datos. Publica la compilación completa para conservar `/`, `/pages/characters/emilia.html`, `/pages/characters/rem.html` y `/pages/characters/ram.html`, además de `assets/`, `social/`, `robots.txt` y `sitemap.xml`.

Los cambios del código se reflejan en el sitio público tras el siguiente despliegue. Después de publicar, comprueba las cuatro páginas, las imágenes sociales, `robots.txt` y `sitemap.xml` en el dominio oficial.

`.gitignore` excluye dependencias, compilaciones, resultados de pruebas y archivos locales o de credenciales. Todo recurso servido por el navegador es público.

## Créditos

Fan site no oficial de **Koridormi**. Las fichas enlazan fuentes oficiales del [anime](https://re-zero-anime.jp/tv/character/) y la [novela](https://re-zero.com/). Las ilustraciones generadas con IA son interpretaciones artísticas, no fotogramas oficiales.

Re:Zero y sus personajes pertenecen a sus respectivos titulares. El código se distribuye bajo la [licencia MIT](LICENSE); los recursos multimedia de terceros no se relicencian como MIT. Normalize.css conserva su aviso de licencia.
