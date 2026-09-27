import type { Plugin } from 'esbuild';
import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Runs stylesheets that use Tailwind through its PostCSS plugin; esbuild has
 * no official Tailwind integration. Files Tailwind scans for class names are
 * reported to esbuild so watch mode rebuilds when a class is added.
 */
export function tailwindPlugin(): Plugin {
  return {
    name: 'tailwindcss',
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        const source = await readFile(args.path, 'utf8');
        if (!/@import\s+['"]tailwindcss/.test(source)) return undefined;

        const result = await postcss([
          tailwindcss({ base: path.dirname(args.path) }),
        ]).process(source, { from: args.path });

        const watchFiles: string[] = [];
        const watchDirs: string[] = [];
        for (const message of result.messages) {
          const { type, file, dir } = message as {
            type: string;
            file?: string;
            dir?: string;
          };
          if (type === 'dependency' && file) watchFiles.push(file);
          if (type === 'dir-dependency' && dir) watchDirs.push(dir);
        }

        return {
          contents: result.css,
          loader: 'css',
          resolveDir: path.dirname(args.path),
          watchFiles,
          watchDirs,
        };
      });
    },
  };
}
