/** @type {import('jest').Config} */
module.exports = {
  // The test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],

  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Clear mocks between tests
  clearMocks: true,

  // Reset modules between tests
  resetModules: true,

  // Verbose output
  verbose: true,

  // Transform files with custom transformer for GAS compatibility
  transform: {
    '^.+\\.js$': '<rootDir>/test/transformers/gas-module-transformer.js'
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Error on deprecated features
  errorOnDeprecated: true
};
