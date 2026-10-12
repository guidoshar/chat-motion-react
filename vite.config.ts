import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const sourceDirectory = fileURLToPath(new URL('./src/', import.meta.url));

export default defineConfig({
  root: 'demo',
  server: { port: 5188, strictPort: true },
  // Strip RSC directives only in the client-only demo. tsc keeps them in the library.
  // Replace with spaces to preserve source positions without another transform dependency.
  plugins: [{
    name: 'client-only-demo',
    enforce: 'pre',
    transform(code, id) {
      if (!id.startsWith(sourceDirectory)) return;
      return { code: code.replace(/^(['"])use client\1;?/m, match => ' '.repeat(match.length)), map: null };
    },
  }],
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
});
