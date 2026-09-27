import type { Preview } from '@storybook/react-vite';

import '@repo/ui/fonts';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      // Theme surfaces from @repo/ui/theme.css
      options: {
        bg: { name: 'Page', value: 'var(--theme-bg)' },
        surface: { name: 'Panel', value: 'var(--theme-surface)' },
      },
    },
  },

  // INFO: uncomment to enable auto-generated documentation for all stories
  // tags: ["autodocs"],
};

export default preview;
