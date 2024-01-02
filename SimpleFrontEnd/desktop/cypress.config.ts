import registerCodeCoverageTasks from '@cypress/code-coverage/task';
import { injectQuasarDevServerConfig } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';
import { defineConfig } from 'cypress';
import { getUserSession } from './test/cypress/plugins/tasks';


export default defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  e2e: {
    experimentalSessionAndOrigin: true,

    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      // tasks(on, config);
      // Register your custom task
      on('task', {
        getUserSession
      });

      return config;
    },
    baseUrl: 'http://localhost:8080/',
    supportFile: 'test/cypress/support/e2e.ts',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  component: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
    supportFile: 'test/cypress/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'test/cypress/support/component-index.html',
    devServer: injectQuasarDevServerConfig(),
  },
  env: {
    SUPABASE_URL: "https://yhotbknfiebbflhovpws.supabase.co",
    SUPABASE_API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob3Ria25maWViYmZsaG92cHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ4NzE5MTEsImV4cCI6MjAxMDQ0NzkxMX0.LmJKiQhg09gO0YHKcHeRLU-T3mcbIaNbebYSrmsCXmM"

  }
});
