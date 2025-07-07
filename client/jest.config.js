const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['@testing-library/jest-dom'],

  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],

  testEnvironment: 'jest-environment-jsdom',

  // Handle module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Handle CSS imports (for CSS Modules)
    '\\.css$': 'identity-obj-proxy',
  },
  // A list of paths to modules that run some code to configure or set up the testing framework before each test.
  setupFiles: ['<rootDir>/jest.setup.js'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
