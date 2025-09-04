/**
 * Unit tests for parseJsonSafe function
 * 
 * Tests the JSON parsing function that provides enhanced error diagnostics
 * and validates the structure of parsed JSON.
 */

// Import the function to test
const { parseJsonSafe } = require('../../../src/RequestParser.js');

// Import test fixtures
const {
  validPayload,
  invalidJsonStrings
} = require('../../fixtures/requestParser.fixtures.js');

describe('parseJsonSafe', () => {
  
  describe('Valid JSON parsing', () => {
    
    test('should parse valid JSON object', () => {
      const validJsonObject = JSON.stringify({ key: 'value', number: 42 });
      const result = parseJsonSafe(validJsonObject);
      
      expect(result).toEqual({ key: 'value', number: 42 });
    });

    test('should parse valid JSON array', () => {
      const validJsonArray = JSON.stringify([1, 2, 'three', { nested: true }]);
      const result = parseJsonSafe(validJsonArray);
      
      expect(result).toEqual([1, 2, 'three', { nested: true }]);
    });

    test('should parse nested JSON structures', () => {
      const nestedJson = JSON.stringify({
        level1: {
          level2: {
            array: [1, 2, { deep: 'value' }],
            boolean: true
          }
        },
        topLevelArray: ['a', 'b', 'c']
      });
      
      const result = parseJsonSafe(nestedJson);
      
      expect(result.level1.level2.array[2].deep).toBe('value');
      expect(result.topLevelArray).toEqual(['a', 'b', 'c']);
    });

    test('should parse JSON with whitespace', () => {
      const jsonWithWhitespace = `
        {
          "key": "value",
          "array": [
            1,
            2,
            3
          ]
        }
      `;
      
      const result = parseJsonSafe(jsonWithWhitespace);
      
      expect(result).toEqual({
        key: 'value',
        array: [1, 2, 3]
      });
    });

    test('should handle special characters and Unicode', () => {
      const specialCharsJson = JSON.stringify({
        unicode: '🚀 Unicode test ñáéíóú',
        newlines: 'Line 1\nLine 2\nLine 3',
        quotes: 'She said "Hello" and he replied \'Hi\'',
        escaped: 'Backslash: \\ Forward slash: /'
      });
      
      const result = parseJsonSafe(specialCharsJson);
      
      expect(result.unicode).toBe('🚀 Unicode test ñáéíóú');
      expect(result.newlines).toBe('Line 1\nLine 2\nLine 3');
      expect(result.quotes).toBe('She said "Hello" and he replied \'Hi\'');
    });
  });

  describe('Input validation errors', () => {
    
    test('should throw ParsingError for non-string input', () => {
      expect(() => {
        parseJsonSafe(123);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        details: expect.objectContaining({
          expectedType: 'string',
          actualType: 'number'
        })
      }));
    });

    test('should throw ParsingError for null input', () => {
      expect(() => {
        parseJsonSafe(null);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        details: expect.objectContaining({
          expectedType: 'string',
          actualType: 'object'
        })
      }));
    });

    test('should throw ParsingError for undefined input', () => {
      expect(() => {
        parseJsonSafe(undefined);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        details: expect.objectContaining({
          expectedType: 'string',
          actualType: 'undefined'
        })
      }));
    });
  });

  describe('Empty and whitespace validation', () => {
    
    test('should throw ParsingError for empty string', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.emptyString);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('empty or whitespace-only string'),
        details: expect.objectContaining({
          inputLength: 0,
          trimmedLength: 0
        })
      }));
    });

    test('should throw ParsingError for whitespace-only string', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.whitespaceOnly);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('empty or whitespace-only string'),
        details: expect.objectContaining({
          inputLength: expect.any(Number),
          trimmedLength: 0
        })
      }));
    });
  });

  describe('JSON syntax error handling', () => {
    
    test('should throw ParsingError for malformed JSON with position info', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.malformedJson);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('JSON syntax error'),
        details: expect.objectContaining({
          line: expect.any(Number),
          column: expect.any(Number),
          position: expect.any(Number),
          originalError: expect.any(String)
        })
      }));
    });

    test('should throw ParsingError for unclosed brace', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.unclosedBrace);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('JSON syntax error'),
        details: expect.objectContaining({
          line: expect.any(Number),
          column: expect.any(Number)
        })
      }));
    });

    test('should throw ParsingError for unclosed array', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.unclosedArray);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('JSON syntax error')
      }));
    });

    test('should throw ParsingError for invalid JSON syntax', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.invalidSyntax);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('JSON syntax error')
      }));
    });
  });

  describe('JSON value validation', () => {
    
    test('should throw ParsingError for null JSON value', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.nullValue);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('root must be an object or array, got null'),
        details: expect.objectContaining({
          expectedType: 'object or array',
          actualType: 'null',
          actualValue: null
        })
      }));
    });

    test('should throw ParsingError for primitive string value', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.primitiveString);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('root must be an object or array, got string'),
        details: expect.objectContaining({
          expectedType: 'object or array',
          actualType: 'string'
        })
      }));
    });

    test('should throw ParsingError for primitive number value', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.primitiveNumber);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('root must be an object or array, got number'),
        details: expect.objectContaining({
          expectedType: 'object or array',
          actualType: 'number'
        })
      }));
    });

    test('should throw ParsingError for primitive boolean value', () => {
      expect(() => {
        parseJsonSafe(invalidJsonStrings.primitiveBoolean);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        path: '/',
        message: expect.stringContaining('root must be an object or array, got boolean'),
        details: expect.objectContaining({
          expectedType: 'object or array',
          actualType: 'boolean'
        })
      }));
    });
  });

  describe('Error position diagnostics', () => {
    
    test('should provide line and column information for multi-line JSON syntax errors', () => {
      const multiLineJson = `{
  "valid": "start",
  "invalid": value-without-quotes
}`;
      
      expect(() => {
        parseJsonSafe(multiLineJson);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        message: expect.stringContaining('JSON syntax error'),
        details: expect.objectContaining({
          line: expect.any(Number),
          column: expect.any(Number)
        })
      }));
    });

    test('should handle position information for syntax errors', () => {
      const invalidJson = '{"key":}';
      
      expect(() => {
        parseJsonSafe(invalidJson);
      }).toThrow(expect.objectContaining({
        errorType: 'PARSING_ERROR',
        message: expect.stringContaining('JSON syntax error'),
        details: expect.objectContaining({
          line: expect.any(Number),
          column: expect.any(Number)
        })
      }));
    });
  });

  describe('Edge cases', () => {
    
    test('should handle very large JSON objects', () => {
      const largeObject = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }
      const largeJson = JSON.stringify(largeObject);
      
      const result = parseJsonSafe(largeJson);
      
      expect(Object.keys(result)).toHaveLength(1000);
      expect(result.key999).toBe('value999');
    });

    test('should handle deeply nested objects', () => {
      let deepObject = { value: 'deep' };
      for (let i = 0; i < 50; i++) {
        deepObject = { nested: deepObject };
      }
      const deepJson = JSON.stringify(deepObject);
      
      const result = parseJsonSafe(deepJson);
      
      let current = result;
      for (let i = 0; i < 50; i++) {
        expect(current).toHaveProperty('nested');
        current = current.nested;
      }
      expect(current.value).toBe('deep');
    });

    test('should handle non-SyntaxError exceptions from JSON.parse', () => {
      // Mock JSON.parse to throw a non-SyntaxError
      const originalJsonParse = JSON.parse;
      const mockError = new Error('Memory allocation failed');
      mockError.name = 'RangeError'; // Not a SyntaxError
      
      JSON.parse = jest.fn(() => {
        throw mockError;
      });

      try {
        expect(() => parseJsonSafe('{"valid": "json"}')).toThrow();
        
        try {
          parseJsonSafe('{"valid": "json"}');
        } catch (error) {
          expect(error.errorType).toBe('PARSING_ERROR');
          expect(error.message).toContain('JSON parsing failed: Memory allocation failed');
          expect(error.path).toBe('/');
          expect(error.details.originalError).toBe('Memory allocation failed');
        }
      } finally {
        // Restore original JSON.parse
        JSON.parse = originalJsonParse;
      }
    });
  });
});
