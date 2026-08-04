import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  // Library build (npm publish)
  if (mode === 'lib') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'UemsDS',
          formats: ['es', 'umd'],
          fileName: (fmt) => fmt === 'umd' ? 'ds.umd.cjs' : `ds.${fmt}.js`,
        },
        cssCodeSplit: false,
        rollupOptions: {
          output: { assetFileNames: 'ds.[ext]' },
        },
        emptyOutDir: true,
      },
    };
  }

  // Default: dev server / docs site
  return {
    root: resolve(__dirname, 'docs'),
    publicDir: resolve(__dirname, 'src/icons'),
    server: { port: 5173, open: true },
    resolve: {
      alias: { '@uems/design-system': resolve(__dirname, 'src/index.js') },
    },
  };
});
