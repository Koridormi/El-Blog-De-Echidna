# Re:Zero Fan Space

Fan site de **Echidna, Emilia, Rem y Ram**, construido con HTML, JavaScript nativo, SCSS y Vite. Echidna es la página de inicio; los enlaces entre personajes funcionan también sin JavaScript.

![Perfil de Echidna en escritorio](media/echidna-desktop.png)

## Explorar y jugar

Cada perfil comparte tres capítulos, seis curiosidades, un expediente ilustrado, temas de color y controles de movimiento y música.

| Personaje | Juego |
| --- | --- |
| Echidna | **El contrato de las tres runas**: deduce un orden secreto con pistas y hasta seis hipótesis. |
| Emilia | **La memoria del hielo**: encuentra cuatro parejas en un tablero que cambia en cada partida. |
| Rem | **La cocina de los pedidos**: prepara tres recetas distintas, ordena los ingredientes y corrige las bandejas. |
| Ram | **El acertijo del viento**: despeja tres senderos con ráfagas en cruz y opción de deshacer. |

Los juegos no tienen límite de tiempo y permiten reiniciar. Sus reglas y mensajes son creaciones del fan site, no contenido canónico del anime.

La música requiere una primera activación explícita. Después conserva activación, silencio y volumen entre personajes y pestañas; recupera la posición al navegar en la misma pestaña. Si el navegador bloquea la reanudación, el botón permite iniciarla de nuevo. Los temas y el audio utilizan `localStorage`; la posición del audio utiliza `sessionStorage`.

Echidna tiene una escena WebM sin sonido que se reproduce automáticamente salvo con movimiento reducido. Las escenas animadas de Emilia, Rem y Ram siguen pendientes y se identifican como placeholders.

[Ver el juego de Echidna en móvil](media/echidna-contract-mobile.png)

## Desarrollo

Se recomienda **Node.js 22.12 o posterior**. Desde la raíz del repositorio:

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
| `npx playwright test` | Ejecuta la suite completa. |
| `npx playwright test --workers=1` | Ejecuta las mismas pruebas en serie para equipos con recursos limitados. |

Si falta el navegador de pruebas, se instala con `npx playwright install chromium`. Todos estos comandos se ejecutan desde `ElblogdeEchidna/`.

## Validación y accesibilidad

Las **35 pruebas** cubren juegos, victoria y reinicio, curiosidades, navegación, estructura de expedientes, metadatos, carga de recursos, audio, animación y teclado. Se comprueban 375, 767, 768, 1023, 1024, 1199, 1200, 1399 y 1400 px.

La interfaz incluye enlace para saltar al contenido, controles etiquetados, foco visible, mensajes de juego anunciados, imágenes con alternativas textuales, cierre de expedientes con Escape y respeto por movimiento reducido. Estas comprobaciones son una revisión básica, no una certificación completa de accesibilidad.

Playwright inicia o reutiliza el servidor de `playwright.config.js`. Capturas de fallos y trazas quedan en `test-results/`, fuera de Git.

## Estructura

```text
ElblogdeEchidna/
├── index.html
├── pages/characters/          # Emilia, Rem y Ram
├── public/echidna-icon.svg
├── src/
│   ├── assets/
│   │   ├── audio/            # Música compartida
│   │   ├── images/           # Echidna y póster de su escena
│   │   ├── characters/       # Ilustraciones por personaje
│   │   └── videos/           # Escena WebM
│   ├── js/
│   │   ├── main.js           # Interacciones de Echidna
│   │   ├── music.js          # Preferencias y reproducción compartidas
│   │   └── characters/      # Perfiles y juegos
│   └── scss/                # Plantilla común y ajustes de personajes
└── tests/
media/                       # Capturas de este README, en la raíz del repo
```

Los retratos `*-character.webp` conservan transparencia; `*-curiosities-card.webp`, `*-game-card.webp`, `echidna-contract-card.webp` y `*-dossier-scene.webp` tienen fondos ilustrados. Los prompts de generación se guardan junto a cada imagen. Se eliminaron imágenes obsoletas, PNG intermedios y el GIF original sin uso; se conserva el WebM que reproduce la web.

## SEO y publicación

Las páginas incluyen títulos y descripciones propios, metadatos Open Graph y Twitter, idioma español y datos estructurados `WebPage`. Las imágenes sociales apuntan a recursos incluidos en la compilación.

Publica el contenido completo de `ElblogdeEchidna/dist/`. Cuando exista un dominio definitivo, añade las URL canónicas, `og:url` y las URL absolutas de imágenes sociales; también podrá generarse el sitemap. No se incluye un dominio ficticio. Si el alojamiento usa un subdirectorio, ajusta la base de Vite para ese destino antes de compilar.

`.gitignore` excluye dependencias, compilaciones, resultados de pruebas y archivos locales o de credenciales. Todo recurso servido por el navegador es público.

## Créditos

Fan site no oficial de **Koridormi**. Las fichas enlazan fuentes oficiales del [anime](https://re-zero-anime.jp/tv/character/) y la [novela](https://re-zero.com/). Las ilustraciones generadas con IA son interpretaciones artísticas, no fotogramas oficiales.

Re:Zero y sus personajes pertenecen a sus respectivos titulares. El código se distribuye bajo la [licencia MIT](LICENSE); los recursos multimedia de terceros no se relicencian como MIT. Normalize.css conserva su aviso de licencia.
