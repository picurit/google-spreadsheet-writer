/**
 * RequestParser Module Test Suite
 * 
 * This file serves as the main entry point for all RequestParser tests.
 * It combines and organizes tests for all public functions in the RequestParser module.
 * 
 * Test Organization:
 * - parseHttpEvent.test.js - Tests for the main HTTP event parsing function
 * - parseJsonSafe.test.js - Tests for JSON parsing with error diagnostics
 * - extractSpreadsheetAndData.test.js - Tests for metadata and data extraction
 * - normalizeSpreadsheetMetadata.test.js - Tests for metadata normalization
 */

// Import all individual test suites
require('./parseHttpEvent.test.js');
require('./parseJsonSafe.test.js'); 
require('./extractSpreadsheetAndData.test.js');
require('./normalizeSpreadsheetMetadata.test.js');

// The individual test files will be executed when this file is loaded
// This provides a single entry point to run all RequestParser tests
