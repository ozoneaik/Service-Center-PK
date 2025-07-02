import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// export default defineConfig(({command}) => {
//
//     const isDev = command === 'serve';
//     return {
//         // เอาไว้สำหรับ test dev config base และ server
//         base: isDev ? '/AOF_WORKS/Service-Center-PK/public/' : '/',
//         server: isDev ? {
//             host: '192.168.9.32',
//             port: 5173,
//             cors: true,
//         } : undefined,
//
//
//         plugins: [
//             laravel({
//                 input: 'resources/js/app.jsx',
//                 refresh: true,
//             }),
//             react(),
//         ],
//     }
// });


export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
