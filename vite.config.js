'use strict';

import { defineConfig } from 'vite';


export default defineConfig({
  test: {
    includeTaskLocation: true,
    include: ['**/*.test.js'],
    name: 'browser',
    browser: {
      provider: 'playwright',
      headless: false,
      enabled: true,
      name: 'chromium',
      providerOptions: {
        launch: {
          devtools: true
      }
    }
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
