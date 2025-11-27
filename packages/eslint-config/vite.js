import { config as reactConfig } from './react-internal.js';

/**
 * A custom ESLint configuration for libraries that use React with Vite.
 *
 * @type {import("eslint").Linter.Config} */
export const config = [...reactConfig];
