import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const sourceDirectory = fileURLToPath(new URL('./src/', import.meta.url));

export default defineConfig({
  root: 'demo',
  // Vite's demo root does not discover tsconfig.demo.json. Explicitly use the
  // automatic runtime in dev and production; components do not import React.
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
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
