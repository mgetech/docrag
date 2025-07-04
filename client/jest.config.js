// client/jest.config.js

/**
 * This is the configuration file for Jest.
 * It tells Jest how to handle our source code.
 */

module.exports = {
  // The root directory that Jest should scan for tests and modules within.
  rootDir: '.',

  // A list of paths to directories that Jest should use to search for files in.
  roots: ['<rootDir>'],

  // The test environment that will be used for testing.
  // 'jsdom' simulates a browser environment, which is needed for testing React components.
  testEnvironment: 'jest-environment-jsdom',

  // A map from regular expressions to paths to transformers.
  // We use 'ts-jest' to transform TypeScript files into JavaScript that Jest can understand.
  transform: {
    '^.+\.tsx?$': 'ts-jest',
  },

  // The glob patterns Jest uses to detect test files.
  testRegex: '(/__tests__/.*|(\.|/)(test|spec))\\.tsx?$',

  // An array of file extensions your modules use.
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // A map from regular expressions to module names that allow to stub out resources
  // with a single module. We configure it to handle CSS modules.
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },

  // A path to a module which exports an async function that is triggered once before all test suites
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // A list of paths to modules that run some code to configure or set up the testing framework before each test.
  setupFiles: ['<rootDir>/jest.setup.js'],
};
