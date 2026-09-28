import type { Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';

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
    // Dark docs chrome (text, tables, code blocks); preview.css paints the page colour
    docs: { theme: themes.dark },
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
