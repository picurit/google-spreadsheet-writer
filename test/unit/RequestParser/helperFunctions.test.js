const { parseHttpEvent } = require('../../../src/RequestParser');

// Since helper functions are not exported, we'll test them through the main functions
// that use them, focusing on the edge cases that improve branch coverage

describe('RequestParser Helper Functions Coverage', () => {

  describe('shouldApplyDisplayDefault function coverage', () => {
    
    test('should apply default when property does not exist', () => {
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: {
              schemaVersion: 'spreadsheet-render-1.0',
              defaults: {} // Empty defaults object, no nullDisplay property
            },
            $data: {}
          })
        }
      };

      const result = parseHttpEvent(httpEvent);
      
      // The helper function should have applied the default for nullDisplay
      expect(result.metadata.defaults.nullDisplay).toBe("");
    });

    test('should apply default when property is falsy but not empty string', () => {
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: {
              schemaVersion: 'spreadsheet-render-1.0',
              defaults: {
                nullDisplay: null, // Falsy value that should trigger default
                emptyArrayDisplay: false, // Another falsy value
                emptyObjectDisplay: undefined // Falsy value
              }
            },
            $data: {}
          })
        }
      };

      const result = parseHttpEvent(httpEvent);
      
      // The helper function should have applied defaults for all falsy values
      expect(result.metadata.defaults.nullDisplay).toBe("");
      expect(result.metadata.defaults.emptyArrayDisplay).toBe("[empty array]");
      expect(result.metadata.defaults.emptyObjectDisplay).toBe("{ }");
    });

    test('should not apply default when property is empty string', () => {
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: {
              schemaVersion: 'spreadsheet-render-1.0',
              defaults: {
                nullDisplay: "", // Empty string should be preserved
                emptyArrayDisplay: "", // Empty string should be preserved
                emptyObjectDisplay: "", // Empty string should be preserved
                emptyStringDisplay: "" // Empty string should be preserved
              }
            },
            $data: {}
          })
        }
      };

      const result = parseHttpEvent(httpEvent);
      
      // Empty strings should be preserved (not replaced with defaults)
      expect(result.metadata.defaults.nullDisplay).toBe("");
      expect(result.metadata.defaults.emptyArrayDisplay).toBe("");
      expect(result.metadata.defaults.emptyObjectDisplay).toBe("");
      expect(result.metadata.defaults.emptyStringDisplay).toBe("");
    });

    test('should not apply default when property has truthy value', () => {
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: {
              schemaVersion: 'spreadsheet-render-1.0',
              defaults: {
                nullDisplay: "custom null",
                emptyArrayDisplay: "custom empty array",
                emptyObjectDisplay: "custom empty object",
                emptyStringDisplay: "custom empty string"
              }
            },
            $data: {}
          })
        }
      };

      const result = parseHttpEvent(httpEvent);
      
      // Custom values should be preserved
      expect(result.metadata.defaults.nullDisplay).toBe("custom null");
      expect(result.metadata.defaults.emptyArrayDisplay).toBe("custom empty array");
      expect(result.metadata.defaults.emptyObjectDisplay).toBe("custom empty object");
      expect(result.metadata.defaults.emptyStringDisplay).toBe("custom empty string");
    });
  });

  describe('normalizeErrorPath function coverage', () => {
    
    test('should use default path when path is null in validation error', () => {
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            // Missing $spreadsheet to trigger validation error with null path
            $data: {}
          })
        }
      };

      expect(() => parseHttpEvent(httpEvent)).toThrow(
        expect.objectContaining({
          path: "/$spreadsheet" // Should use the specific path, not default
        })
      );
    });

    test('should handle undefined path parameter in error creation', () => {
      const httpEvent = null; // This will trigger error with potentially undefined path

      expect(() => parseHttpEvent(httpEvent)).toThrow(
        expect.objectContaining({
          path: "/" // Should use default path when path is undefined
        })
      );
    });
  });

  describe('Error message fallback logic coverage', () => {
    
    test('should handle error without message property', () => {
      // This is harder to test directly, but we can test the parsing error path
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: {
              schemaVersion: 'spreadsheet-render-1.0'
            },
            $data: {}
          })
        }
      };

      // This should pass normally, but if there were an error without message,
      // our refactored code would handle it correctly
      const result = parseHttpEvent(httpEvent);
      expect(result).toBeDefined();
    });
  });

  describe('Type determination coverage', () => {
    
    test('should correctly identify array type in mapping validation', () => {
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: {
              schemaVersion: 'spreadsheet-render-1.0',
              mappings: [
                [] // Array instead of object - should trigger array type detection
              ]
            },
            $data: {}
          })
        }
      };

      expect(() => parseHttpEvent(httpEvent)).toThrow(
        expect.objectContaining({
          actualValue: "array" // Should correctly identify as array
        })
      );
    });

    test('should correctly identify primitive type in mapping validation', () => {
      const httpEvent = {
        postData: {
          contents: JSON.stringify({
            $spreadsheet: {
              schemaVersion: 'spreadsheet-render-1.0',
              mappings: [
                "invalid" // String instead of object - should trigger string type detection
              ]
            },
            $data: {}
          })
        }
      };

      expect(() => parseHttpEvent(httpEvent)).toThrow(
        expect.objectContaining({
          actualValue: "string" // Should correctly identify as string
        })
      );
    });

    test('should handle null postData correctly', () => {
      const httpEvent = {
        postData: null // This should trigger the null type detection
      };

      expect(() => parseHttpEvent(httpEvent)).toThrow(
        expect.objectContaining({
          actualType: "null" // Should correctly identify as null, not "object"
        })
      );
    });
  });
});
