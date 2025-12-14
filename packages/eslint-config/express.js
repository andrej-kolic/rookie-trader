import { config as baseConfig } from './base.js';

export { disableTypeCheck } from './base.js';

/**
 * A custom ESLint configuration for expressjs.
 *
 * @type {import("eslint").Linter.Config} */
export const config = [...baseConfig];
