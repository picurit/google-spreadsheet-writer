/**
 * Unit tests for metadata normalization functions
 * 
 * Tests the various helper functions that normalize and validate
 * spreadsheet metadata structure and apply default values.
 */

// Import the functions to test
const { 
  normalizeSpreadsheetMetadata,
  validateSchemaVersion 
} = require('../../../src/RequestParser.js');

// Import test fixtures
const {
  validSpreadsheetMetadata,
  invalidSpreadsheetMetadata
} = require('../../fixtures/requestParser.fixtures.js');

describe('Metadata Normalization Functions', () => {
  
  describe('normalizeSpreadsheetMetadata', () => {
    
    describe('Valid metadata normalization', () => {
      
      test('should preserve complete valid metadata without changes', () => {
        const result = normalizeSpreadsheetMetadata(validSpreadsheetMetadata);
        
        expect(result.schemaVersion).toBe('spreadsheet-render-1.0');
        expect(result.defaults.sheet.name).toBe('Test Sheet');
        expect(result.defaults.cellStyle.fontSize).toBe(10);
        expect(result.defaults.headerStyle.bold).toBe(true);
        expect(result.mappings).toHaveLength(2);
        expect(result.mappings[0]).toEqual({ id: 'test-mapping-1', path: '/items/*' });
      });

      test('should not mutate the original metadata object', () => {
        const original = JSON.parse(JSON.stringify(validSpreadsheetMetadata));
        const result = normalizeSpreadsheetMetadata(validSpreadsheetMetadata);
        
        // Modify the result to ensure original is not affected
        result.defaults.sheet.name = 'Modified Sheet';
        result.mappings.push({ id: 'new-mapping', path: '/new/path' });
        
        expect(validSpreadsheetMetadata.defaults.sheet.name).toBe('Test Sheet');
        expect(validSpreadsheetMetadata.mappings).toHaveLength(2);
        expect(validSpreadsheetMetadata).toEqual(original);
      });

      test('should handle minimal metadata with required defaults', () => {
        const minimalMetadata = {
          schemaVersion: 'spreadsheet-render-1.0'
        };
        
        const result = normalizeSpreadsheetMetadata(minimalMetadata);
        
        expect(result.schemaVersion).toBe('spreadsheet-render-1.0');
        expect(result.defaults).toBeDefined();
        expect(result.defaults.sheet).toEqual({});
        expect(result.defaults.cellStyle).toEqual({});
        expect(result.defaults.headerStyle).toEqual({});
        expect(result.defaults.typeDefaults).toEqual({});
        expect(result.defaults.globalHeader).toEqual({});
        expect(result.mappings).toEqual([]);
        expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should apply default values for common properties', () => {
        const metadata = { schemaVersion: 'spreadsheet-render-1.0' };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults.numberPrecisionThreshold).toBe(9007199254740991);
        expect(result.defaults.nullDisplay).toBe("");
        expect(result.defaults.emptyArrayDisplay).toBe("[empty array]");
        expect(result.defaults.emptyObjectDisplay).toBe("{ }");
        expect(result.defaults.emptyStringDisplay).toBe("");
      });

      test('should preserve existing defaults and not overwrite them', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            sheet: { name: 'Custom Sheet' },
            nullDisplay: 'CUSTOM NULL',
            emptyArrayDisplay: 'CUSTOM EMPTY ARRAY',
            customProperty: 'preserved'
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults.sheet.name).toBe('Custom Sheet');
        expect(result.defaults.nullDisplay).toBe('CUSTOM NULL');
        expect(result.defaults.emptyArrayDisplay).toBe('CUSTOM EMPTY ARRAY');
        expect(result.defaults.customProperty).toBe('preserved');
        // Should still add missing defaults
        expect(result.defaults.cellStyle).toEqual({});
      });

      test('should handle custom properties while normalizing', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          customProperty: 'should-be-preserved',
          anotherCustom: { nested: 'value' }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.customProperty).toBe('should-be-preserved');
        expect(result.anotherCustom.nested).toBe('value');
        expect(result.defaults).toBeDefined();
        expect(result.mappings).toEqual([]);
      });
    });

    describe('Defaults object normalization', () => {
      
      test('should handle invalid defaults object by creating new one', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: 'invalid-string'
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults).toEqual(expect.objectContaining({
          sheet: {},
          cellStyle: {},
          headerStyle: {},
          typeDefaults: {},
          globalHeader: {}
        }));
      });

      test('should handle null defaults object by creating new one', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: null
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults).toBeDefined();
        expect(result.defaults.sheet).toEqual({});
      });

      test('should handle array defaults by creating new object', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: ['array', 'instead', 'of', 'object']
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults).toBeDefined();
        expect(Array.isArray(result.defaults)).toBe(false);
        expect(result.defaults.sheet).toEqual({});
      });

      test('should handle partial defaults object and fill missing sections', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            sheet: { name: 'Test' },
            cellStyle: { fontSize: 12 },
            // Missing headerStyle, typeDefaults, globalHeader
            customSection: { value: 'preserved' }
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults.sheet.name).toBe('Test');
        expect(result.defaults.cellStyle.fontSize).toBe(12);
        expect(result.defaults.customSection.value).toBe('preserved');
        expect(result.defaults.headerStyle).toEqual({});
        expect(result.defaults.typeDefaults).toEqual({});
        expect(result.defaults.globalHeader).toEqual({});
      });

      test('should handle invalid individual default sections', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            sheet: 'invalid-string',
            cellStyle: null,
            headerStyle: ['invalid', 'array'],
            typeDefaults: { valid: 'object' },
            globalHeader: undefined
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults.sheet).toEqual({});
        expect(result.defaults.cellStyle).toEqual({});
        expect(result.defaults.headerStyle).toEqual({});
        expect(result.defaults.typeDefaults).toEqual({ valid: 'object' });
        expect(result.defaults.globalHeader).toEqual({});
      });
    });

    describe('Mappings array normalization', () => {
      
      test('should handle invalid mappings by creating empty array', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: 'invalid-string'
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.mappings).toEqual([]);
      });

      test('should handle null mappings by creating empty array', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: null
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.mappings).toEqual([]);
      });

      test('should preserve valid mappings array', () => {
        const validMappings = [
          { id: 'map1', path: '/path1' },
          { id: 'map2', path: '/path2' }
        ];
        
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: validMappings
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.mappings).toEqual(validMappings);
      });

      test('should validate mappings structure and throw for invalid mapping', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'valid', path: '/valid' },
            'invalid-mapping'
          ]
        };
        
        expect(() => {
          normalizeSpreadsheetMetadata(metadata);
        }).toThrow(expect.objectContaining({
          errorType: 'SCHEMA_VALIDATION_ERROR',
          path: '/$spreadsheet/mappings/1'
        }));
      });

      test('should validate mapping id and throw for missing id', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { path: '/missing-id' }
          ]
        };
        
        expect(() => {
          normalizeSpreadsheetMetadata(metadata);
        }).toThrow(expect.objectContaining({
          errorType: 'SCHEMA_VALIDATION_ERROR',
          path: '/$spreadsheet/mappings/0/id'
        }));
      });

      test('should validate mapping path and throw for missing path', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: [
            { id: 'missing-path' }
          ]
        };
        
        expect(() => {
          normalizeSpreadsheetMetadata(metadata);
        }).toThrow(expect.objectContaining({
          errorType: 'SCHEMA_VALIDATION_ERROR',
          path: '/$spreadsheet/mappings/0/path'
        }));
      });

      test('should handle very large mappings array', () => {
        const largeMappings = [];
        for (let i = 0; i < 100; i++) {
          largeMappings.push({ id: `map-${i}`, path: `/path/${i}` });
        }
        
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          mappings: largeMappings
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.mappings).toHaveLength(100);
        expect(result.mappings[99]).toEqual({ id: 'map-99', path: '/path/99' });
      });
    });

    describe('PathSyntax normalization', () => {
      
      test('should handle invalid pathSyntax by creating default', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          pathSyntax: 'invalid-string'
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.pathSyntax).toEqual({
          type: 'json-pointer-wildcard'
        });
      });

      test('should handle null pathSyntax by creating default', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          pathSyntax: null
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should handle array pathSyntax by creating default', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          pathSyntax: ['invalid', 'array']
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
      });

      test('should preserve valid pathSyntax and add default type if missing', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          pathSyntax: {
            options: { strict: true },
            customProperty: 'preserved'
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
        expect(result.pathSyntax.options.strict).toBe(true);
        expect(result.pathSyntax.customProperty).toBe('preserved');
      });
    });

    describe('Default values application', () => {
      
      test('should not overwrite existing numeric values with defaults', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            numberPrecisionThreshold: 1000
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults.numberPrecisionThreshold).toBe(1000);
      });

      test('should not overwrite existing string values with defaults', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            nullDisplay: 'CUSTOM_NULL',
            emptyArrayDisplay: 'CUSTOM_EMPTY_ARRAY'
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults.nullDisplay).toBe('CUSTOM_NULL');
        expect(result.defaults.emptyArrayDisplay).toBe('CUSTOM_EMPTY_ARRAY');
        expect(result.defaults.emptyObjectDisplay).toBe('{ }'); // Should still add missing ones
      });

      test('should handle falsy but valid values correctly', () => {
        const metadata = {
          schemaVersion: 'spreadsheet-render-1.0',
          defaults: {
            numberPrecisionThreshold: 0,
            nullDisplay: '',
            emptyArrayDisplay: '',
            emptyObjectDisplay: '',
            emptyStringDisplay: ''
          }
        };
        
        const result = normalizeSpreadsheetMetadata(metadata);
        
        expect(result.defaults.numberPrecisionThreshold).toBe(0);
        expect(result.defaults.nullDisplay).toBe('');
        expect(result.defaults.emptyArrayDisplay).toBe(''); // Should preserve explicit empty string
        expect(result.defaults.emptyObjectDisplay).toBe(''); // Should preserve explicit empty string
        expect(result.defaults.emptyStringDisplay).toBe('');
      });
    });
  });

  describe('validateSchemaVersion', () => {
    
    test('should accept valid schema versions', () => {
      const validVersions = [
        'spreadsheet-render-1.0',
        'spreadsheet-render-2.5',
        'spreadsheet-render-10.99',
        'spreadsheet-render-0.1'
      ];
      
      validVersions.forEach(version => {
        expect(() => {
          validateSchemaVersion({ schemaVersion: version });
        }).not.toThrow();
      });
    });

    test('should throw SchemaValidationError for missing schema version', () => {
      expect(() => {
        validateSchemaVersion({});
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/schemaVersion',
        fieldName: 'schemaVersion',
        expectedValue: 'spreadsheet-render-X.Y',
        actualValue: undefined
      }));
    });

    test('should throw SchemaValidationError for null schema version', () => {
      expect(() => {
        validateSchemaVersion({ schemaVersion: null });
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/schemaVersion',
        fieldName: 'schemaVersion'
      }));
    });

    test('should throw SchemaValidationError for non-string schema version', () => {
      expect(() => {
        validateSchemaVersion({ schemaVersion: 123 });
      }).toThrow(expect.objectContaining({
        errorType: 'SCHEMA_VALIDATION_ERROR',
        path: '/$spreadsheet/schemaVersion',
        fieldName: 'schemaVersion',
        expectedValue: 'string',
        actualValue: 'number'
      }));
    });

    test('should throw SchemaValidationError for invalid schema version format', () => {
      const invalidVersions = [
        'invalid-format',
        'spreadsheet-1.0',
        'render-1.0',
        'spreadsheet-render-',
        'spreadsheet-render-1',
        'spreadsheet-render-1.0.0',
        'spreadsheet-render-a.b'
      ];
      
      invalidVersions.forEach(version => {
        expect(() => {
          validateSchemaVersion({ schemaVersion: version });
        }).toThrow(expect.objectContaining({
          errorType: 'SCHEMA_VALIDATION_ERROR',
          path: '/$spreadsheet/schemaVersion',
          fieldName: 'schemaVersion',
          expectedValue: 'spreadsheet-render-X.Y',
          actualValue: version
        }));
      });
    });
  });

  describe('Complex normalization scenarios', () => {
    
    test('should handle completely empty metadata object', () => {
      const emptyMetadata = {};
      
      // This should work without schema validation since normalizeSpreadsheetMetadata
      // doesn't validate schema version - that's done in extractSpreadsheetAndData
      const result = normalizeSpreadsheetMetadata(emptyMetadata);
      
      // Should add all required defaults
      expect(result.defaults).toBeDefined();
      expect(result.mappings).toEqual([]);
      expect(result.pathSyntax.type).toBe('json-pointer-wildcard');
    });

    test('should handle metadata with all optional fields missing', () => {
      const minimalValid = { schemaVersion: 'spreadsheet-render-1.0' };
      
      const result = normalizeSpreadsheetMetadata(minimalValid);
      
      expect(result).toEqual(expect.objectContaining({
        schemaVersion: 'spreadsheet-render-1.0',
        defaults: expect.objectContaining({
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
        }),
        mappings: [],
        pathSyntax: { type: 'json-pointer-wildcard' }
      }));
    });

    test('should preserve metadata order and additional properties', () => {
      const metadata = {
        customFirst: 'first',
        schemaVersion: 'spreadsheet-render-1.0',
        customMiddle: 'middle',
        defaults: { sheet: { name: 'test' } },
        customLast: 'last'
      };
      
      const result = normalizeSpreadsheetMetadata(metadata);
      
      expect(result.customFirst).toBe('first');
      expect(result.customMiddle).toBe('middle');
      expect(result.customLast).toBe('last');
      expect(result.schemaVersion).toBe('spreadsheet-render-1.0');
    });
  });
});
