/**
 * Test fixtures for RequestParser tests
 * Contains common test data, mock objects, and sample payloads
 */

const validSpreadsheetMetadata = {
  schemaVersion: 'spreadsheet-render-1.0',
  defaults: {
    sheet: {
      name: 'Test Sheet'
    },
    cellStyle: {
      fontSize: 10
    },
    headerStyle: {
      bold: true
    },
    typeDefaults: {
      string: { align: 'left' },
      number: { align: 'right' }
    },
    globalHeader: {
      enabled: true
    }
  },
  mappings: [
    {
      id: 'test-mapping-1',
      path: '/items/*'
    },
    {
      id: 'test-mapping-2', 
      path: '/metadata/info'
    }
  ]
};

const validTestData = {
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ],
  metadata: {
    info: 'Test metadata'
  }
};

const validPayload = {
  $spreadsheet: validSpreadsheetMetadata,
  $data: validTestData
};

const validHttpEvent = {
  postData: {
    contents: JSON.stringify(validPayload),
    type: 'application/json',
    length: JSON.stringify(validPayload).length
  },
  parameter: {},
  parameters: {},
  contextPath: '',
  contentLength: JSON.stringify(validPayload).length,
  queryString: ''
};

const invalidHttpEvents = {
  nullEvent: null,
  undefinedEvent: undefined,
  emptyObject: {},
  noPostData: {
    parameter: {}
  },
  invalidPostData: {
    postData: 'invalid'
  },
  noContents: {
    postData: {
      type: 'application/json'
    }
  },
  nonStringContents: {
    postData: {
      contents: { invalid: true },
      type: 'application/json'
    }
  },
  emptyContents: {
    postData: {
      contents: '',
      type: 'application/json'
    }
  }
};

const invalidJsonStrings = {
  malformedJson: '{ invalid json',
  unclosedBrace: '{ "key": "value"',
  unclosedArray: '[ "item1", "item2"',
  invalidSyntax: '{ "key": value }',
  emptyString: '',
  whitespaceOnly: '   \n\t  ',
  nullValue: 'null',
  primitiveString: '"just a string"',
  primitiveNumber: '42',
  primitiveBoolean: 'true'
};

const invalidPayloads = {
  missingSpreadsheet: {
    $data: validTestData
  },
  missingData: {
    $spreadsheet: validSpreadsheetMetadata
  },
  invalidSpreadsheetType: {
    $spreadsheet: 'invalid',
    $data: validTestData
  },
  nullSpreadsheet: {
    $spreadsheet: null,
    $data: validTestData
  },
  arraySpreadsheet: {
    $spreadsheet: [],
    $data: validTestData
  },
  undefinedData: {
    $spreadsheet: validSpreadsheetMetadata,
    $data: undefined
  }
};

const invalidSpreadsheetMetadata = {
  missingSchemaVersion: {
    defaults: {},
    mappings: []
  },
  invalidSchemaVersionType: {
    schemaVersion: 123,
    defaults: {},
    mappings: []
  },
  invalidSchemaVersionFormat: {
    schemaVersion: 'invalid-format',
    defaults: {},
    mappings: []
  },
  invalidMappingsType: {
    schemaVersion: 'spreadsheet-render-1.0',
    defaults: {},
    mappings: 'invalid'
  },
  invalidMappingStructure: {
    schemaVersion: 'spreadsheet-render-1.0',
    defaults: {},
    mappings: [
      { id: 'valid', path: '/valid' },
      'invalid-mapping',
      { path: '/missing-id' },
      { id: 'missing-path' }
    ]
  }
};

const edgeCasePayloads = {
  minimalValid: {
    $spreadsheet: {
      schemaVersion: 'spreadsheet-render-1.0'
    },
    $data: {}
  },
  largeData: {
    $spreadsheet: validSpreadsheetMetadata,
    $data: {
      items: Array(1000).fill(null).map((_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random()
      }))
    }
  },
  deeplyNestedData: {
    $spreadsheet: validSpreadsheetMetadata,
    $data: {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                value: 'deep'
              }
            }
          }
        }
      }
    }
  },
  complexMappings: {
    $spreadsheet: {
      ...validSpreadsheetMetadata,
      mappings: [
        { id: 'root', path: '/' },
        { id: 'wildcard', path: '/items/*' },
        { id: 'nested-wildcard', path: '/categories/*/items/*' },
        { id: 'deep-path', path: '/data/reports/quarterly/q1/metrics' }
      ]
    },
    $data: validTestData
  }
};

module.exports = {
  validSpreadsheetMetadata,
  validTestData,
  validPayload,
  validHttpEvent,
  invalidHttpEvents,
  invalidJsonStrings,
  invalidPayloads,
  invalidSpreadsheetMetadata,
  edgeCasePayloads
};
