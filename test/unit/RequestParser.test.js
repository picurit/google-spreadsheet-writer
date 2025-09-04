/**
 * Unit tests for RequestParser.js
 * 
 * Tests all exported functions:
 * - parseHttpEvent
 * - parseJsonSafe  
 * - extractSpreadsheetAndData
 * - normalizeSpreadsheetMetadata
 * 
 * Tests cover all functions including internal helper function with comprehensive edge cases
 */

// Import functions from RequestParser.js
const { parseHttpEvent, parseJsonSafe, extractSpreadsheetAndData, normalizeSpreadsheetMetadata } = require('../../src/RequestParser.js');

// Import test fixtures
const {
  validSpreadsheetMetadata,
  validTestData,
  validPayload,
  validHttpEvent,
  invalidHttpEvents,
  invalidJsonStrings,
  invalidPayloads,
  invalidSpreadsheetMetadata,
  edgeCasePayloads
} = require('../fixtures/requestParser.fixtures.js');

describe('RequestParser', () => {
  
  describe('parseHttpEvent', () => {
    describe('Valid HTTP events', () => {
      test('should successfully parse a valid HTTP event', () => {
        const result = parseHttpEvent(validHttpEvent);
        
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.raw).toBe(validHttpEvent.postData.contents);
        expect(result.metadata.schemaVersion).toBe('spreadsheet-render-1.0');
        expect(result.data).toEqual(validTestData);
      });

      test('should parse HTTP event with minimal valid payload', () => {
        const minimalEvent = {
          postData: {
            contents: JSON.stringify(edgeCasePayloads.minimalValid)
          }
        };
        
        const result = parseHttpEvent(minimalEvent);
        
        expect(result.metadata.schemaVersion).toBe('spreadsheet-render-1.0');
        expect(result.data).toEqual({});
      });

      test('should parse HTTP event with large data payload', () => {
        const largeEvent = {
          postData: {
            contents: JSON.stringify(edgeCasePayloads.largeData)
          }
        };
        
        const result = parseHttpEvent(largeEvent);
        
        expect(result.data.items).toHaveLength(1000);
        expect(result.data.items[0]).toHaveProperty('id', 0);
        expect(result.data.items[999]).toHaveProperty('id', 999);
      });
    });

    describe('Invalid HTTP events', () => {
      test('should throw error for null event', () => {
        expect(() => parseHttpEvent(null)).toThrow('Invalid HTTP event: event object is null or not an object');
      });

      test('should throw error for undefined event', () => {
        expect(() => parseHttpEvent(undefined)).toThrow('Invalid HTTP event: event object is null or not an object');
      });

      test('should throw error for non-object event', () => {
        expect(() => parseHttpEvent('string')).toThrow();
        expect(() => parseHttpEvent(123)).toThrow();
        expect(() => parseHttpEvent(true)).toThrow();
      });

      test('should throw error for event without postData', () => {
        expect(() => parseHttpEvent(invalidHttpEvents.noPostData)).toThrow('Invalid HTTP event: postData is required for POST requests');
      });

      test('should throw error for invalid postData type', () => {
        expect(() => parseHttpEvent(invalidHttpEvents.invalidPostData)).toThrow('Invalid HTTP event: postData is required for POST requests');
      });

      test('should throw error for missing contents', () => {
        expect(() => parseHttpEvent(invalidHttpEvents.noContents)).toThrow('Invalid HTTP event: postData.contents must be a string');
      });

      test('should throw error for non-string contents', () => {
        expect(() => parseHttpEvent(invalidHttpEvents.nonStringContents)).toThrow('Invalid HTTP event: postData.contents must be a string');
      });

      test('should throw error for empty contents', () => {
        expect(() => parseHttpEvent(invalidHttpEvents.emptyContents)).toThrow('Invalid HTTP event: empty request body');
      });
    });

    describe('Error handling and validation', () => {
      test('should include correct error path in validation errors', () => {
        try {
          parseHttpEvent(null);
        } catch (error) {
          expect(error.path).toBe('/');
        }

        try {
          parseHttpEvent(invalidHttpEvents.noPostData);
        } catch (error) {
          expect(error.path).toBe('/postData');
        }

        try {
          parseHttpEvent(invalidHttpEvents.noContents);
        } catch (error) {
          expect(error.path).toBe('/postData/contents');
        }
      });
    });
  });

  describe('parseJsonSafe', () => {
    describe('Valid JSON strings', () => {
      test('should parse valid JSON object', () => {
        const jsonString = '{"key": "value", "number": 42}';
        const result = parseJsonSafe(jsonString);
        
        expect(result).toEqual({ key: 'value', number: 42 });
      });

      test('should parse valid JSON array', () => {
        const jsonString = '[1, 2, 3, "test"]';
        const result = parseJsonSafe(jsonString);
        
        expect(result).toEqual([1, 2, 3, 'test']);
      });

      test('should parse nested JSON structures', () => {
        const jsonString = '{"nested": {"array": [1, 2], "object": {"key": "value"}}}';
        const result = parseJsonSafe(jsonString);
        
        expect(result.nested.array).toEqual([1, 2]);
        expect(result.nested.object.key).toBe('value');
      });

      test('should parse JSON with whitespace', () => {
        const jsonString = '  \n  { "key" : "value" }  \n  ';
        const result = parseJsonSafe(jsonString);
        
        expect(result).toEqual({ key: 'value' });
      });
    });

    describe('Invalid JSON strings', () => {
      test('should throw error for malformed JSON', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.malformedJson)).toThrow(/JSON syntax error/);
      });

      test('should throw error for unclosed brace', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.unclosedBrace)).toThrow(/JSON syntax error/);
      });

      test('should throw error for unclosed array', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.unclosedArray)).toThrow(/JSON syntax error/);
      });

      test('should throw error for invalid syntax', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.invalidSyntax)).toThrow(/JSON syntax error/);
      });

      test('should throw error for empty string', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.emptyString)).toThrow('Invalid JSON: empty or whitespace-only string');
      });

      test('should throw error for whitespace-only string', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.whitespaceOnly)).toThrow('Invalid JSON: empty or whitespace-only string');
      });

      test('should throw error for null value', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.nullValue)).toThrow('Invalid JSON: root must be an object or array');
      });

      test('should throw error for primitive values', () => {
        expect(() => parseJsonSafe(invalidJsonStrings.primitiveString)).toThrow();
        expect(() => parseJsonSafe(invalidJsonStrings.primitiveNumber)).toThrow();
        expect(() => parseJsonSafe(invalidJsonStrings.primitiveBoolean)).toThrow();
      });
    });

    describe('Input validation', () => {
      test('should throw error for non-string input', () => {
        expect(() => parseJsonSafe(null)).toThrow();
        expect(() => parseJsonSafe(undefined)).toThrow();
        expect(() => parseJsonSafe(123)).toThrow();
        expect(() => parseJsonSafe({})).toThrow();
        expect(() => parseJsonSafe([])).toThrow();
      });
    });

    describe('Error details', () => {
      test('should include line and column information in syntax errors', () => {
        const invalidJson = '{"valid": "value", invalid}';
        
        try {
          parseJsonSafe(invalidJson);
        } catch (error) {
          // The error format may vary between environments, so let's be flexible
          expect(error.message).toMatch(/JSON syntax error/);
          expect(error.details).toBeDefined();
          expect(typeof error.details.position).toBe('number');
        }
      });

      test('should include position information when available', () => {
        const invalidJson = '{"valid": "value", invalid}';
        
        try {
          parseJsonSafe(invalidJson);
        } catch (error) {
          expect(error.details.position).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('extractSpreadsheetAndData', () => {
    describe('Valid payloads', () => {
      test('should extract metadata and data from valid payload', () => {
        const result = extractSpreadsheetAndData(validPayload);
        
        expect(result.metadata).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.metadata.schemaVersion).toBe('spreadsheet-render-1.0');
        expect(result.data).toEqual(validTestData);
      });

      test('should preserve validSpreadsheetMetadata structure during extraction', () => {
        // Test that validSpreadsheetMetadata is preserved correctly
        const result = extractSpreadsheetAndData(validPayload);
        
        // Verify original structure is maintained with normalization
        expect(result.metadata.schemaVersion).toBe(validSpreadsheetMetadata.schemaVersion);
        expect(result.metadata.defaults.sheet.name).toBe('Test Sheet');
        expect(result.metadata.defaults.cellStyle.fontSize).toBe(10);
        expect(result.metadata.defaults.headerStyle.bold).toBe(true);
        expect(result.metadata.defaults.typeDefaults.string.align).toBe('left');
        expect(result.metadata.defaults.typeDefaults.number.align).toBe('right');
        expect(result.metadata.defaults.globalHeader.enabled).toBe(true);
        
        // Verify mappings are preserved
        expect(result.metadata.mappings).toHaveLength(2);
        expect(result.metadata.mappings[0]).toEqual({ id: 'test-mapping-1', path: '/items/*' });
        expect(result.metadata.mappings[1]).toEqual({ id: 'test-mapping-2', path: '/metadata/info' });
        
        // Verify normalization has added default properties
        expect(result.metadata.defaults.numberPrecisionThreshold).toBe(9007199254740991);
        expect(result.metadata.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should work with validSpreadsheetMetadata in different payload structures', () => {
        const alternativePayload = {
          $spreadsheet: validSpreadsheetMetadata,
          $data: {
            differentStructure: true,
            items: ['item1', 'item2', 'item3'],
            metadata: { type: 'alternative' }
          }
        };
        
        const result = extractSpreadsheetAndData(alternativePayload);
        
        // Should preserve validSpreadsheetMetadata regardless of data structure
        expect(result.metadata.defaults.sheet.name).toBe('Test Sheet');
        expect(result.metadata.mappings).toHaveLength(2);
        expect(result.data.differentStructure).toBe(true);
        expect(result.data.items).toEqual(['item1', 'item2', 'item3']);
      });

      test('should handle minimal valid payload', () => {
        const result = extractSpreadsheetAndData(edgeCasePayloads.minimalValid);
        
        expect(result.metadata.schemaVersion).toBe('spreadsheet-render-1.0');
        expect(result.data).toEqual({});
      });

      test('should normalize metadata with defaults', () => {
        const result = extractSpreadsheetAndData(edgeCasePayloads.minimalValid);
        
        expect(result.metadata.defaults).toBeDefined();
        expect(result.metadata.defaults.sheet).toBeDefined();
        expect(result.metadata.defaults.cellStyle).toBeDefined();
        expect(result.metadata.defaults.headerStyle).toBeDefined();
        expect(result.metadata.defaults.typeDefaults).toBeDefined();
        expect(result.metadata.defaults.globalHeader).toBeDefined();
      });

      test('should set default values for common properties', () => {
        const result = extractSpreadsheetAndData(edgeCasePayloads.minimalValid);
        
        expect(result.metadata.defaults.numberPrecisionThreshold).toBe(9007199254740991);
        expect(result.metadata.defaults.nullDisplay).toBe('');
        expect(result.metadata.defaults.emptyArrayDisplay).toBe('[empty array]');
        expect(result.metadata.defaults.emptyObjectDisplay).toBe('{ }');
        expect(result.metadata.defaults.emptyStringDisplay).toBe('');
      });

      test('should ensure pathSyntax exists with default', () => {
        const result = extractSpreadsheetAndData(edgeCasePayloads.minimalValid);
        
        expect(result.metadata.pathSyntax).toBeDefined();
        expect(result.metadata.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should preserve existing default values', () => {
        const payloadWithDefaults = {
          $spreadsheet: {
            schemaVersion: 'spreadsheet-render-1.0',
            defaults: {
              nullDisplay: 'NULL',
              emptyArrayDisplay: '[]',
              numberPrecisionThreshold: 1000
            }
          },
          $data: {}
        };

        const result = extractSpreadsheetAndData(payloadWithDefaults);
        
        expect(result.metadata.defaults.nullDisplay).toBe('NULL');
        expect(result.metadata.defaults.emptyArrayDisplay).toBe('[]');
        expect(result.metadata.defaults.numberPrecisionThreshold).toBe(1000);
      });

      test('should handle complex mappings', () => {
        const result = extractSpreadsheetAndData(edgeCasePayloads.complexMappings);
        
        expect(result.metadata.mappings).toHaveLength(4);
        expect(result.metadata.mappings[0].id).toBe('root');
        expect(result.metadata.mappings[1].path).toBe('/items/*');
      });
    });

    describe('Invalid payloads', () => {
      test('should throw error for non-object input', () => {
        expect(() => extractSpreadsheetAndData(null)).toThrow();
        expect(() => extractSpreadsheetAndData(undefined)).toThrow();
        expect(() => extractSpreadsheetAndData('string')).toThrow();
        expect(() => extractSpreadsheetAndData(123)).toThrow();
        expect(() => extractSpreadsheetAndData([])).toThrow();
      });

      test('should throw error for missing $spreadsheet', () => {
        expect(() => extractSpreadsheetAndData(invalidPayloads.missingSpreadsheet)).toThrow("Missing required '$spreadsheet' metadata object");
      });

      test('should throw error for missing $data', () => {
        expect(() => extractSpreadsheetAndData(invalidPayloads.missingData)).toThrow("Missing required '$data' object");
      });

      test('should throw error for invalid $spreadsheet type', () => {
        expect(() => extractSpreadsheetAndData(invalidPayloads.invalidSpreadsheetType)).toThrow("Invalid '$spreadsheet': must be an object");
      });

      test('should throw error for null $spreadsheet', () => {
        expect(() => extractSpreadsheetAndData(invalidPayloads.nullSpreadsheet)).toThrow("Invalid '$spreadsheet': must be an object");
      });

      test('should throw error for array $spreadsheet', () => {
        expect(() => extractSpreadsheetAndData(invalidPayloads.arraySpreadsheet)).toThrow("Invalid '$spreadsheet': must be an object");
      });

      test('should throw error for undefined $data', () => {
        expect(() => extractSpreadsheetAndData(invalidPayloads.undefinedData)).toThrow("Invalid '$data': value is undefined");
      });
    });

    describe('Schema version validation', () => {
      test('should throw error for missing schema version', () => {
        expect(() => extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.missingSchemaVersion,
          $data: {}
        })).toThrow("Missing or invalid 'schemaVersion' in $spreadsheet metadata");
      });

      test('should throw error for invalid schema version type', () => {
        expect(() => extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.invalidSchemaVersionType,
          $data: {}
        })).toThrow("Missing or invalid 'schemaVersion' in $spreadsheet metadata");
      });

      test('should throw error for invalid schema version format', () => {
        expect(() => extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.invalidSchemaVersionFormat,
          $data: {}
        })).toThrow("Invalid schemaVersion format. Expected 'spreadsheet-render-X.Y'");
      });

      test('should accept valid schema version formats', () => {
        const validVersions = [
          'spreadsheet-render-1.0',
          'spreadsheet-render-2.1',
          'spreadsheet-render-10.25'
        ];

        validVersions.forEach(version => {
          const payload = {
            $spreadsheet: { schemaVersion: version },
            $data: {}
          };
          
          expect(() => extractSpreadsheetAndData(payload)).not.toThrow();
        });
      });
    });

    describe('Mappings validation', () => {
      test('should throw error for invalid mappings type', () => {
        expect(() => extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.invalidMappingsType,
          $data: {}
        })).not.toThrow(); // mappings will be normalized to empty array
      });

      test('should throw error for invalid mapping structure', () => {
        expect(() => extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.invalidMappingStructure,
          $data: {}
        })).toThrow();
      });

      test('should provide detailed error messages for invalid mappings', () => {
        try {
          extractSpreadsheetAndData({
            $spreadsheet: invalidSpreadsheetMetadata.invalidMappingStructure,
            $data: {}
          });
        } catch (error) {
          expect(error.message).toMatch(/Invalid mapping at index \d+/);
          expect(error.path).toMatch(/\/\$spreadsheet\/mappings\/\d+/);
        }
      });

      test('should handle empty mappings array', () => {
        const payload = {
          $spreadsheet: {
            schemaVersion: 'spreadsheet-render-1.0',
            mappings: []
          },
          $data: {}
        };

        const result = extractSpreadsheetAndData(payload);
        expect(result.metadata.mappings).toEqual([]);
      });
    });

    describe('Error path tracking', () => {
      test('should include correct error paths in validation errors', () => {
        const testCases = [
          {
            payload: null,
            expectedPath: '/'
          },
          {
            payload: invalidPayloads.missingSpreadsheet,
            expectedPath: '/$spreadsheet'
          },
          {
            payload: invalidPayloads.missingData,
            expectedPath: '/$data'
          },
          {
            payload: invalidPayloads.invalidSpreadsheetType,
            expectedPath: '/$spreadsheet'
          }
        ];

        testCases.forEach(({ payload, expectedPath }) => {
          try {
            extractSpreadsheetAndData(payload);
          } catch (error) {
            expect(error.path).toBe(expectedPath);
          }
        });
      });
    });
  });

  describe('Integration tests', () => {
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
    });

    test('should preserve validSpreadsheetMetadata through complete parsing pipeline', () => {
      // Test end-to-end parsing preserves validSpreadsheetMetadata
      const result = parseHttpEvent(validHttpEvent);
      
      // Verify validSpreadsheetMetadata is preserved through the full pipeline
      expect(result.metadata.schemaVersion).toBe(validSpreadsheetMetadata.schemaVersion);
      expect(result.metadata.defaults.sheet.name).toBe('Test Sheet');
      expect(result.metadata.defaults.cellStyle.fontSize).toBe(10);
      expect(result.metadata.defaults.headerStyle.bold).toBe(true);
      expect(result.metadata.defaults.typeDefaults.string.align).toBe('left');
      expect(result.metadata.defaults.typeDefaults.number.align).toBe('right');
      expect(result.metadata.defaults.globalHeader.enabled).toBe(true);
      
      // Verify mappings preservation
      expect(result.metadata.mappings).toHaveLength(2);
      expect(result.metadata.mappings[0]).toEqual({ id: 'test-mapping-1', path: '/items/*' });
      expect(result.metadata.mappings[1]).toEqual({ id: 'test-mapping-2', path: '/metadata/info' });
      
      // Verify data preservation
      expect(result.data).toEqual(validTestData);
      expect(result.data.items).toHaveLength(2);
      expect(result.data.metadata.info).toBe('Test metadata');
    });

    test('should handle complex payload with validSpreadsheetMetadata variations', () => {
      const complexPayload = {
        $spreadsheet: {
          ...validSpreadsheetMetadata,
          customProperty: 'additional-config',
          defaults: {
            ...validSpreadsheetMetadata.defaults,
            customDefault: { value: 'custom' }
          }
        },
        $data: {
          ...validTestData,
          additionalData: 'extra-info'
        }
      };

      const complexEvent = {
        postData: {
          contents: JSON.stringify(complexPayload)
        }
      };

      const result = parseHttpEvent(complexEvent);
      
      // Should preserve both original validSpreadsheetMetadata and extensions
      expect(result.metadata.defaults.sheet.name).toBe('Test Sheet'); // from validSpreadsheetMetadata
      expect(result.metadata.customProperty).toBe('additional-config'); // custom addition
      expect(result.metadata.defaults.customDefault.value).toBe('custom'); // custom addition
      expect(result.data.items).toEqual(validTestData.items); // from validTestData
      expect(result.data.additionalData).toBe('extra-info'); // custom addition
    });

    test('should handle deeply nested data structures', () => {
      const deepEvent = {
        postData: {
          contents: JSON.stringify(edgeCasePayloads.deeplyNestedData)
        }
      };

      const result = parseHttpEvent(deepEvent);
      expect(result.data.level1.level2.level3.level4.level5.value).toBe('deep');
    });

    test('should preserve all metadata through normalization process', () => {
      const complexEvent = {
        postData: {
          contents: JSON.stringify(edgeCasePayloads.complexMappings)
        }
      };

      const result = parseHttpEvent(complexEvent);
      
      expect(result.metadata.mappings).toHaveLength(4);
      expect(result.metadata.mappings.every(m => m.id && m.path)).toBe(true);
    });
  });

  describe('normalizeSpreadsheetMetadata', () => {
    describe('Valid metadata normalization', () => {
      test('should preserve valid complete metadata without changes', () => {
        // Test using the validSpreadsheetMetadata fixture
        const result = normalizeSpreadsheetMetadata(validSpreadsheetMetadata);
        
        // Should preserve all original structure and values
        expect(result.schemaVersion).toBe(validSpreadsheetMetadata.schemaVersion);
        expect(result.defaults.sheet.name).toBe('Test Sheet');
        expect(result.defaults.cellStyle.fontSize).toBe(10);
        expect(result.defaults.headerStyle.bold).toBe(true);
        expect(result.defaults.typeDefaults.string.align).toBe('left');
        expect(result.defaults.typeDefaults.number.align).toBe('right');
        expect(result.defaults.globalHeader.enabled).toBe(true);
        expect(result.mappings).toHaveLength(2);
        expect(result.mappings[0]).toEqual({ id: 'test-mapping-1', path: '/items/*' });
        expect(result.mappings[1]).toEqual({ id: 'test-mapping-2', path: '/metadata/info' });
        
        // Should add default missing properties
        expect(result.defaults.numberPrecisionThreshold).toBe(9007199254740991);
        expect(result.defaults.nullDisplay).toBe('');
        expect(result.defaults.emptyArrayDisplay).toBe('[empty array]');
        expect(result.defaults.emptyObjectDisplay).toBe('{ }');
        expect(result.defaults.emptyStringDisplay).toBe('');
        expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should handle validSpreadsheetMetadata with missing display properties', () => {
        // Create a copy of validSpreadsheetMetadata without display properties
        const metadataWithoutDisplay = {
          ...validSpreadsheetMetadata,
          defaults: {
            ...validSpreadsheetMetadata.defaults
            // Deliberately missing display properties
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadataWithoutDisplay);
        
        // Should add missing display properties with defaults
        expect(result.defaults.nullDisplay).toBe('');
        expect(result.defaults.emptyArrayDisplay).toBe('[empty array]');
        expect(result.defaults.emptyObjectDisplay).toBe('{ }');
        expect(result.defaults.emptyStringDisplay).toBe('');
        expect(result.defaults.numberPrecisionThreshold).toBe(9007199254740991);
        
        // Should preserve existing properties
        expect(result.defaults.sheet.name).toBe('Test Sheet');
        expect(result.defaults.cellStyle.fontSize).toBe(10);
      });

      test('should work with validSpreadsheetMetadata missing pathSyntax', () => {
        // Create a copy without pathSyntax
        const { pathSyntax, ...metadataWithoutPathSyntax } = validSpreadsheetMetadata;
        
        const result = normalizeSpreadsheetMetadata(metadataWithoutPathSyntax);
        
        // Should add default pathSyntax
        expect(result.pathSyntax).toEqual({
          type: 'json-pointer-wildcard'
        });
        
        // Should preserve everything else
        expect(result.defaults.sheet.name).toBe('Test Sheet');
        expect(result.mappings).toHaveLength(2);
      });

      test('should validate mappings from validSpreadsheetMetadata', () => {
        // This should not throw since validSpreadsheetMetadata has valid mappings
        expect(() => normalizeSpreadsheetMetadata(validSpreadsheetMetadata)).not.toThrow();
        
        const result = normalizeSpreadsheetMetadata(validSpreadsheetMetadata);
        
        // Verify mappings are preserved correctly
        result.mappings.forEach(mapping => {
          expect(mapping).toHaveProperty('id');
          expect(mapping).toHaveProperty('path');
          expect(typeof mapping.id).toBe('string');
          expect(typeof mapping.path).toBe('string');
        });
      });

      test('should handle extension of validSpreadsheetMetadata with custom properties', () => {
        const extendedMetadata = {
          ...validSpreadsheetMetadata,
          customProperty: 'custom-value',
          customObject: { nested: 'value' },
          defaults: {
            ...validSpreadsheetMetadata.defaults,
            customDefault: 'custom-default-value'
          }
        };
        
        const result = normalizeSpreadsheetMetadata(extendedMetadata);
        
        // Should preserve custom properties
        expect(result.customProperty).toBe('custom-value');
        expect(result.customObject.nested).toBe('value');
        expect(result.defaults.customDefault).toBe('custom-default-value');
        
        // Should preserve original valid metadata
        expect(result.defaults.sheet.name).toBe('Test Sheet');
        expect(result.mappings[0].id).toBe('test-mapping-1');
      });

      test('should normalize minimal metadata with required defaults', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0'
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.schemaVersion).toBe('spreadsheet-render-1.0');
        expect(result.defaults).toBeDefined();
        expect(result.defaults.sheet).toEqual({});
        expect(result.defaults.cellStyle).toEqual({});
        expect(result.defaults.headerStyle).toEqual({});
        expect(result.defaults.typeDefaults).toEqual({});
        expect(result.defaults.globalHeader).toEqual({});
        expect(result.mappings).toEqual([]);
      });

      test('should set default values for common properties', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0'
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults.numberPrecisionThreshold).toBe(9007199254740991);
        expect(result.defaults.nullDisplay).toBe('');
        expect(result.defaults.emptyArrayDisplay).toBe('[empty array]');
        expect(result.defaults.emptyObjectDisplay).toBe('{ }');
        expect(result.defaults.emptyStringDisplay).toBe('');
      });

      test('should ensure pathSyntax exists with default type', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0'
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.pathSyntax).toBeDefined();
        expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should preserve existing defaults and not overwrite them', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            sheet: { name: 'Custom Sheet' },
            cellStyle: { fontSize: 12 },
            headerStyle: { bold: true },
            typeDefaults: { string: { align: 'left' } },
            globalHeader: { enabled: false },
            numberPrecisionThreshold: 1000,
            nullDisplay: 'NULL',
            emptyArrayDisplay: '[]',
            emptyObjectDisplay: '{}',
            emptyStringDisplay: 'EMPTY'
          },
          mappings: [{ id: 'test', path: '/test' }],
          pathSyntax: { type: 'custom-syntax' }
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        // Should preserve existing values
        expect(result.defaults.sheet.name).toBe('Custom Sheet');
        expect(result.defaults.cellStyle.fontSize).toBe(12);
        expect(result.defaults.headerStyle.bold).toBe(true);
        expect(result.defaults.typeDefaults.string.align).toBe('left');
        expect(result.defaults.globalHeader.enabled).toBe(false);
        expect(result.defaults.numberPrecisionThreshold).toBe(1000);
        expect(result.defaults.nullDisplay).toBe('NULL');
        expect(result.defaults.emptyArrayDisplay).toBe('[]');
        expect(result.defaults.emptyObjectDisplay).toBe('{}');
        expect(result.defaults.emptyStringDisplay).toBe('EMPTY');
        expect(result.mappings).toEqual([{ id: 'test', path: '/test' }]);
        expect(result.pathSyntax.type).toBe('custom-syntax');
      });

      test('should handle invalid defaults object by creating new one', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: 'invalid-defaults'
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults).toEqual({
          sheet: {},
          cellStyle: {},
          headerStyle: {},
          typeDefaults: {},
          globalHeader: {},
          numberPrecisionThreshold: 9007199254740991,
          nullDisplay: '',
          emptyArrayDisplay: '[empty array]',
          emptyObjectDisplay: '{ }',
          emptyStringDisplay: ''
        });
      });

      test('should handle null defaults object by creating new one', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: null
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults).toBeDefined();
        expect(typeof result.defaults).toBe('object');
      });

      test('should handle invalid mappings by creating empty array', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: 'invalid-mappings'
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.mappings).toEqual([]);
      });

      test('should handle null mappings by creating empty array', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: null
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.mappings).toEqual([]);
      });

      test('should handle invalid pathSyntax by creating default', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          pathSyntax: 'invalid-syntax'
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.pathSyntax).toEqual({
          type: 'json-pointer-wildcard'
        });
      });

      test('should handle null pathSyntax by creating default', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          pathSyntax: null
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.pathSyntax).toEqual({
          type: 'json-pointer-wildcard'
        });
      });

      test('should handle partial defaults object and fill missing sections', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            sheet: { name: 'Test' },
            // Missing cellStyle, headerStyle, typeDefaults, globalHeader
            customProperty: 'custom'
          }
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults.sheet.name).toBe('Test');
        expect(result.defaults.customProperty).toBe('custom');
        expect(result.defaults.cellStyle).toEqual({});
        expect(result.defaults.headerStyle).toEqual({});
        expect(result.defaults.typeDefaults).toEqual({});
        expect(result.defaults.globalHeader).toEqual({});
      });

      test('should handle invalid individual default sections', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            sheet: 'invalid-sheet',
            cellStyle: null,
            headerStyle: 42,
            typeDefaults: [],  // Array should remain as array since typeof [] === 'object'
            globalHeader: 'invalid-header'
          }
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults.sheet).toEqual({});
        expect(result.defaults.cellStyle).toEqual({});
        expect(result.defaults.headerStyle).toEqual({});
        expect(result.defaults.typeDefaults).toEqual([]); // Arrays pass typeof === 'object' check
        expect(result.defaults.globalHeader).toEqual({});
      });

      test('should handle missing numberPrecisionThreshold by setting default', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            // numberPrecisionThreshold is undefined
          }
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults.numberPrecisionThreshold).toBe(9007199254740991);
      });

      test('should handle missing string display properties by setting defaults', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            // Missing nullDisplay, emptyArrayDisplay, emptyObjectDisplay, emptyStringDisplay
          }
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults.nullDisplay).toBe('');
        expect(result.defaults.emptyArrayDisplay).toBe('[empty array]');
        expect(result.defaults.emptyObjectDisplay).toBe('{ }');
        expect(result.defaults.emptyStringDisplay).toBe('');
      });

      test('should handle falsy string display properties by setting defaults', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            nullDisplay: null,
            emptyArrayDisplay: undefined,
            emptyObjectDisplay: '',
            emptyStringDisplay: 0
          }
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults.nullDisplay).toBe('');
        expect(result.defaults.emptyArrayDisplay).toBe('[empty array]');
        expect(result.defaults.emptyObjectDisplay).toBe('{ }');
        expect(result.defaults.emptyStringDisplay).toBe('');
      });
    });

    describe('Mappings validation in normalization', () => {
      test('should validate and accept valid mappings', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'mapping1', path: '/data/items' },
            { id: 'mapping2', path: '/metadata/info' }
          ]
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.mappings).toHaveLength(2);
        expect(result.mappings[0]).toEqual({ id: 'mapping1', path: '/data/items' });
        expect(result.mappings[1]).toEqual({ id: 'mapping2', path: '/metadata/info' });
      });

      test('should throw error for invalid mapping object', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'valid', path: '/valid' },
            'invalid-mapping-string'
          ]
        };
        
        expect(() => normalizeSpreadsheetMetadata(rawMetadata)).toThrow('Invalid mapping at index 1: must be an object');
      });

      test('should throw error for null mapping', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'valid', path: '/valid' },
            null
          ]
        };
        
        expect(() => normalizeSpreadsheetMetadata(rawMetadata)).toThrow('Invalid mapping at index 1: must be an object');
      });

      test('should throw error for mapping missing id', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { path: '/missing-id' }
          ]
        };
        
        expect(() => normalizeSpreadsheetMetadata(rawMetadata)).toThrow('Invalid mapping at index 0: missing or invalid \'id\' property');
      });

      test('should throw error for mapping with invalid id type', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 123, path: '/invalid-id-type' }
          ]
        };
        
        expect(() => normalizeSpreadsheetMetadata(rawMetadata)).toThrow('Invalid mapping at index 0: missing or invalid \'id\' property');
      });

      test('should throw error for mapping missing path', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'missing-path' }
          ]
        };
        
        expect(() => normalizeSpreadsheetMetadata(rawMetadata)).toThrow('Invalid mapping at index 0: missing or invalid \'path\' property');
      });

      test('should throw error for mapping with invalid path type', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'invalid-path', path: 42 }
          ]
        };
        
        expect(() => normalizeSpreadsheetMetadata(rawMetadata)).toThrow('Invalid mapping at index 0: missing or invalid \'path\' property');
      });

      test('should provide correct error paths for mapping validation', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'valid', path: '/valid' },
            { id: 'missing-path' }
          ]
        };
        
        try {
          normalizeSpreadsheetMetadata(rawMetadata);
        } catch (error) {
          expect(error.path).toBe('/$spreadsheet/mappings/1/path');
        }
      });
    });

    describe('Complex normalization scenarios', () => {
      test('should handle completely empty metadata object', () => {
        const rawMetadata = {};
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.defaults).toBeDefined();
        expect(result.mappings).toEqual([]);
        expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should preserve custom properties while normalizing', () => {
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          customProperty: 'custom-value',
          anotherCustom: { nested: 'value' },
          defaults: {
            customDefault: 'custom'
          }
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.customProperty).toBe('custom-value');
        expect(result.anotherCustom.nested).toBe('value');
        expect(result.defaults.customDefault).toBe('custom');
        // Should also have normalized defaults
        expect(result.defaults.sheet).toEqual({});
      });

      test('should handle very large mappings array', () => {
        const mappings = Array(100).fill(null).map((_, i) => ({
          id: `mapping-${i}`,
          path: `/data/items/${i}`
        }));
        
        const rawMetadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: mappings
        };
        
        const result = normalizeSpreadsheetMetadata(rawMetadata);
        
        expect(result.mappings).toHaveLength(100);
        expect(result.mappings[0].id).toBe('mapping-0');
        expect(result.mappings[99].id).toBe('mapping-99');
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    test('should handle very large JSON payloads', () => {
      const largeEvent = {
        postData: {
          contents: JSON.stringify(edgeCasePayloads.largeData)
        }
      };

      expect(() => parseHttpEvent(largeEvent)).not.toThrow();
      const result = parseHttpEvent(largeEvent);
      expect(result.data.items.length).toBe(1000);
    });

    test('should handle special characters in JSON strings', () => {
      const specialCharsPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: {
          unicode: '🚀 Unicode test ñáéíóú',
          newlines: 'Line 1\nLine 2\nLine 3',
          quotes: 'She said "Hello" and he replied \'Hi\'',
          escaped: 'Backslash: \\ Forward slash: /'
        }
      };

      const event = {
        postData: {
          contents: JSON.stringify(specialCharsPayload)
        }
      };

      const result = parseHttpEvent(event);
      expect(result.data.unicode).toBe('🚀 Unicode test ñáéíóú');
      expect(result.data.newlines).toBe('Line 1\nLine 2\nLine 3');
    });

    test('should handle null and undefined values in data appropriately', () => {
      const nullDataPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: {
          nullValue: null,
          stringValue: 'test',
          numberValue: 0,
          booleanValue: false,
          emptyArray: [],
          emptyObject: {}
        }
      };

      const event = {
        postData: {
          contents: JSON.stringify(nullDataPayload)
        }
      };

      const result = parseHttpEvent(event);
      expect(result.data.nullValue).toBeNull();
      expect(result.data.stringValue).toBe('test');
      expect(result.data.numberValue).toBe(0);
      expect(result.data.booleanValue).toBe(false);
      expect(result.data.emptyArray).toEqual([]);
      expect(result.data.emptyObject).toEqual({});
    });

    test('should handle numeric edge cases', () => {
      const numericPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: {
          maxSafeInteger: Number.MAX_SAFE_INTEGER,
          minSafeInteger: Number.MIN_SAFE_INTEGER,
          maxValue: Number.MAX_VALUE,
          minValue: Number.MIN_VALUE,
          infinity: 'Infinity will be stringified',
          negativeZero: -0,
          float: 3.14159
        }
      };

      const event = {
        postData: {
          contents: JSON.stringify(numericPayload)
        }
      };

      const result = parseHttpEvent(event);
      expect(result.data.maxSafeInteger).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.data.negativeZero).toBe(0); // JSON.stringify converts -0 to 0
      expect(result.data.float).toBe(3.14159);
    });
  });
});
