import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node, sin DOM: si algo de la capa compartida dependiera del navegador, fallaría aquí
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
  },
});
