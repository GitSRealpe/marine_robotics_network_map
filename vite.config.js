import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: '/marine_robotics_network_map/', // Important for GitHub Pages to load assets correctly
    build: {
        outDir: 'dist', // Default output folder
        sourcemap: true, // Helps with debugging
    },
    server: {
        port: 3000,
        open: false, // Automatically open browser
    },
    plugins: [
        tailwindcss(),
    ],
});
