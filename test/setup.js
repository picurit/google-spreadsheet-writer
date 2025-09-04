/**
 * Jest test setup file
 * 
 * This file is executed before each test suite and provides:
 * - Global test utilities and helpers
 * - Custom matchers
 * - Mock setup and cleanup
 */

// Add custom matchers or global test utilities here
global.testHelpers = {
  /**
   * Create a mock Google Apps Script HTTP event object
   * @param {Object} options - Configuration options
   * @param {string} options.contents - JSON string contents
   * @param {string} options.contentType - Content type header
   * @returns {Object} Mock HTTP event object
   */
  createMockHttpEvent: (options = {}) => {
    const {
      contents = '{}',
      contentType = 'application/json'
    } = options;

    return {
      postData: {
        contents: contents,
        type: contentType,
        length: contents.length
      },
      parameter: {},
      parameters: {},
      contextPath: '',
      contentLength: contents.length,
      queryString: ''
    };
  },

  /**
   * Create a valid spreadsheet metadata object for testing
   * @param {Object} overrides - Optional property overrides
   * @returns {Object} Valid spreadsheet metadata
   */
  createValidSpreadsheetMetadata: (overrides = {}) => {
    return {
      schemaVersion: 'spreadsheet-render-1.0',
      defaults: {
        sheet: {},
        cellStyle: {},
        headerStyle: {},
        typeDefaults: {},
        globalHeader: {},
        numberPrecisionThreshold: 9007199254740991,
        nullDisplay: "",
        emptyArrayDisplay: "[empty array]",
        emptyObjectDisplay: "{ }",
        emptyStringDisplay: ""
      },
      mappings: [],
      pathSyntax: {
        type: "json-pointer-wildcard"
      },
      ...overrides
    };
  },

  /**
   * Create a valid payload object for testing
   * @param {Object} options - Configuration options
   * @returns {Object} Valid payload object
   */
  createValidPayload: (options = {}) => {
    const {
      metadata = testHelpers.createValidSpreadsheetMetadata(),
      data = { test: 'value' }
    } = options;

    return {
      $spreadsheet: metadata,
      $data: data
    };
  }
};

// Mock console methods in tests to avoid noise
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any test-specific state
  jest.restoreAllMocks();
});

// Export test utilities for individual test files
module.exports = {
  testHelpers: global.testHelpers
};
