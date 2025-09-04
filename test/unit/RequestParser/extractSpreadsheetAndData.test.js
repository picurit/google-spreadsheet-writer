/**
 * Unit tests for extractSpreadsheetAndData function
 * 
 * Tests the extraction and validation of $spreadsheet metadata and $data
 * from parsed JSON objects.
 */

// Import the function to test
const { extractSpreadsheetAndData } = require('../../../src/RequestParser.js');

// Import test fixtures
const {
  validSpreadsheetMetadata,
  validTestData,
  validPayload,
  invalidPayloads,
  invalidSpreadsheetMetadata
} = require('../../fixtures/requestParser.fixtures.js');

describe('extractSpreadsheetAndData', () => {
  
  describe('Valid payload extraction', () => {
    
    test('should extract metadata and data from valid payload', () => {
      const result = extractSpreadsheetAndData(validPayload);
      
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(validTestData);
      
      // Verify metadata structure is preserved
      expect(result.metadata.schemaVersion).toBe('spreadsheet-render-1.0');
      expect(result.metadata.defaults.sheet.name).toBe('Test Sheet');
      expect(result.metadata.mappings).toHaveLength(2);
    });

    test('should normalize metadata with complete defaults structure', () => {
      const result = extractSpreadsheetAndData(validPayload);
      
      // Verify all required default sections are present
      expect(result.metadata.defaults).toHaveProperty('sheet');
      expect(result.metadata.defaults).toHaveProperty('cellStyle');
      expect(result.metadata.defaults).toHaveProperty('headerStyle');
      expect(result.metadata.defaults).toHaveProperty('typeDefaults');
      expect(result.metadata.defaults).toHaveProperty('globalHeader');
      
      // Verify default values are applied
      expect(result.metadata.defaults.numberPrecisionThreshold).toBe(9007199254740991);
      expect(result.metadata.defaults.nullDisplay).toBe("");
      expect(result.metadata.defaults.emptyArrayDisplay).toBe("[empty array]");
      expect(result.metadata.defaults.emptyObjectDisplay).toBe("{ }");
      expect(result.metadata.defaults.emptyStringDisplay).toBe("");
    });

    test('should handle minimal valid payload', () => {
      const minimalPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: { test: 'data' }
      };
      
      const result = extractSpreadsheetAndData(minimalPayload);
      
      expect(result.metadata.schemaVersion).toBe('spreadsheet-render-1.0');
      expect(result.data).toEqual({ test: 'data' });
      expect(result.metadata.defaults).toBeDefined();
      expect(result.metadata.mappings).toEqual([]);
      expect(result.metadata.pathSyntax.type).toBe('json-pointer-wildcard');
    });

    test('should preserve complex data structures', () => {
      const complexData = {
        items: [
          { id: 1, nested: { value: 'test', array: [1, 2, 3] } },
          { id: 2, nested: { value: 'test2', array: [4, 5, 6] } }
        ],
        metadata: {
          created: new Date().toISOString(),
          tags: ['tag1', 'tag2'],
          config: { enabled: true, threshold: 0.95 }
        }
      };
      
      const complexPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: complexData
      };
      
      const result = extractSpreadsheetAndData(complexPayload);
      
      expect(result.data).toEqual(complexData);
      expect(result.data.items[0].nested.array).toEqual([1, 2, 3]);
      expect(result.data.metadata.config.threshold).toBe(0.95);
    });

    test('should handle null and special values in data', () => {
      const specialData = {
        nullValue: null,
        zeroValue: 0,
        falseValue: false,
        emptyString: '',
        emptyArray: [],
        emptyObject: {},
        undefinedBecomes: null // JSON.stringify converts undefined to null or omits it
      };
      
      const specialPayload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: specialData
      };
      
      const result = extractSpreadsheetAndData(specialPayload);
      
      expect(result.data.nullValue).toBeNull();
      expect(result.data.zeroValue).toBe(0);
      expect(result.data.falseValue).toBe(false);
      expect(result.data.emptyString).toBe('');
      expect(result.data.emptyArray).toEqual([]);
      expect(result.data.emptyObject).toEqual({});
    });
  });

  describe('Payload structure validation', () => {
    
    test('should throw ValidationError for non-object input', () => {
      expect(() => {
        extractSpreadsheetAndData('not an object');
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/',
        message: expect.stringContaining('root must be an object')
      }));
    });

    test('should throw ValidationError for array input', () => {
      expect(() => {
        extractSpreadsheetAndData(['array', 'input']);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/',
        message: expect.stringContaining('root must be an object')
      }));
    });

    test('should throw ValidationError for null input', () => {
      expect(() => {
        extractSpreadsheetAndData(null);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/',
        message: expect.stringContaining('root must be an object')
      }));
    });

    test('should throw ValidationError for missing $spreadsheet', () => {
      expect(() => {
        extractSpreadsheetAndData(invalidPayloads.missingSpreadsheet);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/$spreadsheet',
        message: expect.stringContaining("Missing required '$spreadsheet'")
      }));
    });

    test('should throw ValidationError for missing $data', () => {
      expect(() => {
        extractSpreadsheetAndData(invalidPayloads.missingData);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/$data',
        message: expect.stringContaining("Missing required '$data'")
      }));
    });

    test('should throw ValidationError for invalid $spreadsheet type', () => {
      expect(() => {
        extractSpreadsheetAndData(invalidPayloads.invalidSpreadsheetType);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/$spreadsheet',
        message: expect.stringContaining("Invalid '$spreadsheet': must be an object")
      }));
    });

    test('should throw ValidationError for null $spreadsheet', () => {
      expect(() => {
        extractSpreadsheetAndData(invalidPayloads.nullSpreadsheet);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/$spreadsheet',
        message: expect.stringContaining("Invalid '$spreadsheet': must be an object")
      }));
    });

    test('should throw ValidationError for array $spreadsheet', () => {
      expect(() => {
        extractSpreadsheetAndData(invalidPayloads.arraySpreadsheet);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/$spreadsheet',
        message: expect.stringContaining("Invalid '$spreadsheet': must be an object")
      }));
    });

    test('should throw ValidationError for undefined $data', () => {
      expect(() => {
        extractSpreadsheetAndData(invalidPayloads.undefinedData);
      }).toThrow(expect.objectContaining({
        errorType: 'VALIDATION_ERROR',
        path: '/$data',
        message: expect.stringContaining("Invalid '$data': value is undefined")
      }));
    });
  });

  describe('Schema version validation', () => {
    
    test('should throw SchemaValidationError for missing schema version', () => {
      expect(() => {
        extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.missingSchemaVersion,
          $data: { test: 'data' }
        });
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/schemaVersion',
        fieldName: 'schemaVersion',
        expectedValue: 'spreadsheet-render-X.Y',
        actualValue: undefined
      }));
    });

    test('should throw SchemaValidationError for invalid schema version type', () => {
      expect(() => {
        extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.invalidSchemaVersionType,
          $data: { test: 'data' }
        });
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/schemaVersion',
        fieldName: 'schemaVersion',
        expectedValue: 'string',
        actualValue: 'number'
      }));
    });

    test('should throw SchemaValidationError for invalid schema version format', () => {
      expect(() => {
        extractSpreadsheetAndData({
          $spreadsheet: invalidSpreadsheetMetadata.invalidSchemaVersionFormat,
          $data: { test: 'data' }
        });
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/schemaVersion',
        fieldName: 'schemaVersion',
        expectedValue: 'spreadsheet-render-X.Y',
        actualValue: 'invalid-format'
      }));
    });

    test('should accept valid schema version formats', () => {
      const validVersions = [
        'spreadsheet-render-1.0',
        'spreadsheet-render-2.5',
        'spreadsheet-render-10.99'
      ];
      
      validVersions.forEach(version => {
        const payload = {
          $spreadsheet: { schemaVersion: version },
          $data: { test: 'data' }
        };
        
        expect(() => {
          extractSpreadsheetAndData(payload);
        }).not.toThrow();
      });
    });
  });

  describe('Mappings validation', () => {
    
    test('should handle empty mappings array', () => {
      const payload = {
        $spreadsheet: { 
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [] 
        },
        $data: { test: 'data' }
      };
      
      const result = extractSpreadsheetAndData(payload);
      
      expect(result.metadata.mappings).toEqual([]);
    });

    test('should validate complex mappings structure', () => {
      const complexMappings = [
        { id: 'mapping-1', path: '/items/*' },
        { id: 'mapping-2', path: '/metadata/info' },
        { id: 'mapping-3', path: '/data/**' },
        { id: 'mapping-4', path: '/nested/array/*/values' }
      ];
      
      const payload = {
        $spreadsheet: {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: complexMappings
        },
        $data: { test: 'data' }
      };
      
      const result = extractSpreadsheetAndData(payload);
      
      expect(result.metadata.mappings).toHaveLength(4);
      expect(result.metadata.mappings).toEqual(complexMappings);
    });

    test('should throw SchemaValidationError for invalid mapping structure', () => {
      const payload = {
        $spreadsheet: {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'valid', path: '/valid' },
            'invalid-mapping' // This should cause an error
          ]
        },
        $data: { test: 'data' }
      };
      
      expect(() => {
        extractSpreadsheetAndData(payload);
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/mappings/1',
        expectedValue: 'object',
        actualValue: 'string'
      }));
    });

    test('should throw SchemaValidationError for mapping missing id', () => {
      const payload = {
        $spreadsheet: {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { path: '/missing-id' }
          ]
        },
        $data: { test: 'data' }
      };
      
      expect(() => {
        extractSpreadsheetAndData(payload);
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/mappings/0/id',
        expectedValue: 'non-empty string'
      }));
    });

    test('should throw SchemaValidationError for mapping missing path', () => {
      const payload = {
        $spreadsheet: {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'missing-path' }
          ]
        },
        $data: { test: 'data' }
      };
      
      expect(() => {
        extractSpreadsheetAndData(payload);
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/mappings/0/path',
        expectedValue: 'non-empty string'
      }));
    });
  });

  describe('Metadata normalization', () => {
    
    test('should create defaults object when missing', () => {
      const payload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: { test: 'data' }
      };
      
      const result = extractSpreadsheetAndData(payload);
      
      expect(result.metadata.defaults).toBeDefined();
      expect(result.metadata.defaults.sheet).toEqual({});
      expect(result.metadata.defaults.cellStyle).toEqual({});
      expect(result.metadata.defaults.headerStyle).toEqual({});
      expect(result.metadata.defaults.typeDefaults).toEqual({});
      expect(result.metadata.defaults.globalHeader).toEqual({});
    });

    test('should preserve existing defaults and add missing sections', () => {
      const payload = {
        $spreadsheet: {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            sheet: { name: 'Custom Sheet' },
            customProperty: 'preserved'
          }
        },
        $data: { test: 'data' }
      };
      
      const result = extractSpreadsheetAndData(payload);
      
      expect(result.metadata.defaults.sheet.name).toBe('Custom Sheet');
      expect(result.metadata.defaults.customProperty).toBe('preserved');
      expect(result.metadata.defaults.cellStyle).toEqual({});
      expect(result.metadata.defaults.headerStyle).toEqual({});
    });

    test('should ensure pathSyntax exists with default', () => {
      const payload = {
        $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' },
        $data: { test: 'data' }
      };
      
      const result = extractSpreadsheetAndData(payload);
      
      expect(result.metadata.pathSyntax).toBeDefined();
      expect(result.metadata.pathSyntax.type).toBe('json-pointer-wildcard');
    });

    test('should preserve custom pathSyntax configuration', () => {
      const payload = {
        $spreadsheet: {
          schemaVersion: 'spreadsheet-render-1.0',
          pathSyntax: {
            type: 'custom-syntax',
            options: { strict: true }
          }
        },
        $data: { test: 'data' }
      };
      
      const result = extractSpreadsheetAndData(payload);
      
      expect(result.metadata.pathSyntax.type).toBe('custom-syntax');
      expect(result.metadata.pathSyntax.options.strict).toBe(true);
    });
  });

  describe('Error path tracking', () => {
    
    test('should provide correct error paths for nested validation errors', () => {
      const testCases = [
        {
          payload: { $data: { test: 'data' } },
          expectedPath: '/$spreadsheet'
        },
        {
          payload: { $spreadsheet: { schemaVersion: 'spreadsheet-render-1.0' } },
          expectedPath: '/$data'
        },
        {
          payload: {
            $spreadsheet: { schemaVersion: 123 },
            $data: { test: 'data' }
          },
          expectedPath: '/$spreadsheet/schemaVersion'
        }
      ];
      
      testCases.forEach(({ payload, expectedPath }) => {
        expect(() => {
          extractSpreadsheetAndData(payload);
        }).toThrow(expect.objectContaining({
          path: expectedPath
        }));
      });
    });
  });
});
