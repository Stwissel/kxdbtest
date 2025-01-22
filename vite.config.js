'use strict';

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    includeTaskLocation: true,
    include: ['**/*.test.js'],
    name: 'browser',
    browser: {
      provider: 'playwright',
      headless: true,
      enabled: true,
      name: 'chromium',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html']
      }
    }
  }
});

