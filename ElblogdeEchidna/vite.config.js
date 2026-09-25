import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    build: {
        rolldownOptions: {
            input: {
                index: fileURLToPath(new URL('./index.html', import.meta.url)),
                emilia: fileURLToPath(new URL('./pages/characters/emilia.html', import.meta.url)),
                rem: fileURLToPath(new URL('./pages/characters/rem.html', import.meta.url)),
                ram: fileURLToPath(new URL('./pages/characters/ram.html', import.meta.url)),
            }
        }
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
    }
});
