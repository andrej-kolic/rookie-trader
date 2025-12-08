# Rookie Trader

A simple exchange built on top of the Kraken API.

## 🚀 Tech Stack

- **Monorepo**: Managed with [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces).
- **Languages**: 100% [TypeScript](https://www.typescriptlang.org/).
- **Frontend**: React.
- **Component Development**: [Storybook](https://storybook.js.org/) for UI component development and testing.
- **Bundlers**: Vite, Webpack, and ESBuild (demonstrating multiple build strategies).
- **Infrastructure**: AWS (CloudFormation) and Netlify.

## 🛠 Prerequisites

- **Node.js**: (Check `.nvmrc` for version)
- **pnpm**: `v10.18.0` or higher

## 🏁 Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Environment Setup:**
   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. **Start Development Server:**
   To start all apps:

   ```bash
   pnpm dev
   ```

   To start a specific app (e.g., using vite):

   ```bash
   BUNDLER=app-vite pnpm dev:app
   ```

## 📂 Project Structure

### Apps

- **`app-esbuild`**: Main application bundled with ESBuild.
- **`app-vite`**: Main application bundled with Vite.
- **`app-webpack`**: Main application bundled with Webpack.
- **`ui-storybook`**: Storybook development environment for the UI library.

### Packages

- **`app-core`**: Core React application logic (developed as a library).
- **`commons`**: Shared utility library (built with tsup).
- **`dev-tools`**: Development utilities and shared configurations.
- **`@repo/ui`**: Shared React component library.
- **`@repo/eslint-config`**: Shared ESLint configurations.
- **`@repo/typescript-config`**: Shared TypeScript configurations.

### Infrastructure

- **`infra/aws`**: CloudFormation templates for AWS deployment (CloudFront, S3, ACM).
- **`infra/netlify`**: Scripts and tools for Netlify deployment.

## 📜 Scripts

### Development

- `pnpm dev`: Start all applications in development mode.
- `pnpm dev:app`: Start a specific app (requires `BUNDLER` env var).
- `pnpm dev:ui`: Start Storybook.
- `pnpm preview`: Preview production builds locally.

### Build

- `pnpm build`: Build all apps and packages.
- `pnpm build:app`: Build a specific app.

### Quality & Maintenance

- `pnpm lint`: Run ESLint across the workspace.
- `pnpm test`: Run tests.
- `pnpm quality-checks`: Run dependencies check, type check, lint, and tests.
- `pnpm format:code`: Format code with Prettier.
- `pnpm check:dependencies`: Check dependency versions with syncpack.

### Deployment

- `pnpm deploy:aws`: Deploy to AWS (requires configuration).
- `pnpm deploy:netlify`: Deploy to Netlify.

## 🐛 Debugging

To debug the application in Chrome:

1. Open Chrome with remote debugging enabled:

   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=remote-debug-profile
   ```

   _(Note: Data will be saved to the 'remote-debug-profile' directory)_

2. Use the VS Code debugger to attach to the process.
   See [VS Code React Debugging](https://code.visualstudio.com/docs/nodejs/reactjs-tutorial#_debugging-react) for more details.
