/**
 * Unit tests for parseHttpEvent function
 * 
 * Tests the main entry point function that processes Google Apps Script HTTP events
 * and returns normalized parsed payloads.
 */

// Import the function to test
const { parseHttpEvent } = require('../../../src/RequestParser.js');

// Import test fixtures
const {
  validHttpEvent,
  invalidHttpEvents,
  validSpreadsheetMetadata,
  validTestData
} = require('../../fixtures/requestParser.fixtures.js');

describe('parseHttpEvent', () => {
  
  describe('Valid HTTP events', () => {
    
    test('should successfully parse a valid HTTP event', () => {
      const result = parseHttpEvent(validHttpEvent);
      
      expect(result).toMatchObject({
        metadata: expect.objectContaining({
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: expect.any(Object),
          mappings: expect.any(Array)
        }),
        data: validTestData,
        raw: validHttpEvent.postData.contents
      });
      
      // Verify metadata structure
      expect(result.metadata.defaults.sheet.name).toBe('Test Sheet');
      expect(result.metadata.mappings).toHaveLength(2);
      expect(result.metadata.mappings[0].id).toBe('test-mapping-1');
    });

    test('should parse HTTP event with minimal valid payload', () => {
      const minimalPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: { test: 'data' }
      };
      
      const minimalEvent = {
        postData: {
          contents: JSON.stringify(minimalPayload)
        }
      };

      const result = parseHttpEvent(minimalEvent);
      
      expect(result.metadata.schemaVersion).toBe('spreadsheet-render-1.0');
      expect(result.data).toEqual({ test: 'data' });
      expect(result.metadata.defaults).toBeDefined();
      expect(result.metadata.mappings).toEqual([]);
    });

    test('should preserve complex data structures', () => {
      const complexData = {
        items: [
          { id: 1, nested: { value: 'test', array: [1, 2, 3] } },
          { id: 2, nested: { value: 'test2', array: [4, 5, 6] } }
        ],
        metadata: {
          created: new Date().toISOString(),
          tags: ['tag1', 'tag2']
        }
      };
      
      const complexPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: complexData
      };
      
      const complexEvent = {
        postData: {
          contents: JSON.stringify(complexPayload)
        }
      };

      const result = parseHttpEvent(complexEvent);
      
      expect(result.data).toEqual(complexData);
      expect(result.data.items[0].nested.array).toEqual([1, 2, 3]);
    });
  });

  describe('Invalid HTTP events - Structure validation', () => {
    
    test('should throw HttpEventError for null event', () => {
      expect(() => {
        parseHttpEvent(invalidHttpEvents.nullEvent);
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/',
        expectedType: 'object',
        actualType: 'null'
      }));
    });

    test('should throw HttpEventError for undefined event', () => {
      expect(() => {
        parseHttpEvent(invalidHttpEvents.undefinedEvent);
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/',
        expectedType: 'object',
        actualType: 'undefined'
      }));
    });

    test('should throw HttpEventError for non-object event', () => {
      expect(() => {
        parseHttpEvent('not an object');
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/',
        expectedType: 'object',
        actualType: 'string'
      }));
    });

    test('should throw HttpEventError for event without postData', () => {
      expect(() => {
        parseHttpEvent(invalidHttpEvents.noPostData);
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/postData',
        expectedType: 'object'
      }));
    });

    test('should throw HttpEventError for invalid postData type', () => {
      expect(() => {
        parseHttpEvent(invalidHttpEvents.invalidPostData);
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/postData',
        expectedType: 'object',
        actualType: 'string'
      }));
    });

    test('should throw HttpEventError for missing contents', () => {
      expect(() => {
        parseHttpEvent(invalidHttpEvents.noContents);
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/postData/contents',
        expectedType: 'string',
        actualType: 'undefined'
      }));
    });

    test('should throw HttpEventError for non-string contents', () => {
      expect(() => {
        parseHttpEvent(invalidHttpEvents.nonStringContents);
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/postData/contents',
        expectedType: 'string',
        actualType: 'object'
      }));
    });

    test('should throw HttpEventError for empty contents', () => {
      expect(() => {
        parseHttpEvent(invalidHttpEvents.emptyContents);
      }).toThrow(expect.objectContaining({
        errorType: 'HTTP_EVENT_ERROR',
        path: '/postData/contents',
        message: expect.stringContaining('empty request body')
      }));
    });
  });

  describe('Integration error handling', () => {
    
    test('should propagate JSON parsing errors with proper context', () => {
      const invalidJsonEvent = {
        postData: {
          contents: '{ invalid json'
        }
      };

      expect(() => {
        parseHttpEvent(invalidJsonEvent);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        details: expect.objectContaining({
          line: expect.any(Number),
          column: expect.any(Number)
        })
      }));
    });

    test('should propagate schema validation errors', () => {
      const invalidSchemaEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: { schemaVersion: 'invalid-format' },
            $data: { test: 'data' }
          })
        }
      };

      expect(() => {
        parseHttpEvent(invalidSchemaEvent);
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/schemaVersion',
        fieldName: 'schemaVersion'
      }));
    });

    test('should handle missing $spreadsheet with proper error', () => {
      const missingSpreadsheetEvent = {
        postData: {
          contents: JSON.stringify({
            $data: { test: 'data' }
          })
        }
      };

      expect(() => {
        parseHttpEvent(missingSpreadsheetEvent);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/$spreadsheet'
      }));
    });
  });

  describe('End-to-end parsing pipeline', () => {
    
    test('should successfully parse complete valid HTTP event end-to-end', () => {
      const result = parseHttpEvent(validHttpEvent);
      
      expect(result).toMatchObject({
        metadata: expect.objectContaining({
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: expect.any(Object),
          mappings: expect.any(Array)
        }),
        data: validTestData,
        raw: validHttpEvent.postData.contents
      });
      
      // Verify complete metadata preservation
      expect(result.metadata.schemaVersion).toBe(validSpreadsheetMetadata.schemaVersion);
      expect(result.metadata.defaults.sheet.name).toBe('Test Sheet');
      expect(result.metadata.defaults.cellStyle.fontSize).toBe(10);
      expect(result.metadata.defaults.headerStyle.bold).toBe(true);
      
      // Verify complete data preservation
      expect(result.data).toEqual(validTestData);
      expect(result.data.items).toHaveLength(2);
      expect(result.data.metadata.info).toBe('Test metadata');
    });

    test('should handle complex nested structures correctly', () => {
      const deepNestedData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep',
                  array: [1, 2, { nested: 'object' }]
                }
              }
            }
          }
        }
      };
      
      const deepEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
            $data: deepNestedData
          })
        }
      };

      const result = parseHttpEvent(deepEvent);
      expect(result.data.level1.level2.level3.level4.level5.value).toBe('deep');
      expect(result.data.level1.level2.level3.level4.level5.array[2].nested).toBe('object');
    });
  });
});
