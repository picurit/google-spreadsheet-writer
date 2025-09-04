/**
 * Parsing & request normalization utilities.
 * Parses raw HTTP body into {@link ParsedPayload} object.
 *
 * - {@link parseHttpEvent} - Parses an Apps Script HTTP event into a normalized payload.
 * - {@link validateHttpEventStructure} - Validates the basic structure of HTTP events.
 * - {@link parseJsonSafe} - Safe wrapper for JSON.parse with error handling.
 * - {@link extractSpreadsheetAndData} - Extracts $spreadsheet and $data from parsed JSON.
 * - {@link validateSchemaVersion} - Validates schema version format and content.
 * - {@link normalizeSpreadsheetMetadata} - Normalizes and validates spreadsheet metadata.
 * - {@link validateMappingsStructure} - Validates the structure of mapping specifications.
 * - {@link applyDefaultValues} - Applies default values to normalized metadata.
 *
 * @namespace RequestParser
 */

/**
 * [{@link RequestParser}]
 *
 * Safely parse an Apps Script HTTP event into a normalized parsed payload.
 * 
 * Behavior:
 * - Receives a standard Apps Script HTTP POST event object.
 * - Validates and extracts the POST body through structured validation.
 * - Returns a normalized payload for further processing or throws a structured error.
 *
 * @param {HttpRequestEvent} httpEvent - Apps Script HTTP POST event object.
 * @returns {ParsedPayload} - Normalized payload to be used in the application.
 * @throws {HttpEventError|ParsingError|ValidationError|SchemaValidationError} - If parsing or validation fails.
 */
function parseHttpEvent(httpEvent) {
    // Validate basic event structure
    const validatedEvent = validateHttpEventStructure(httpEvent);
    
    // Extract and validate the raw JSON string
    const rawJsonString = validatedEvent.postData.contents;
    
    // Parse the JSON safely with enhanced error handling
    const parsedJson = parseJsonSafe(rawJsonString);
    
    // Extract spreadsheet metadata and data with validation
    const { metadata, data } = extractSpreadsheetAndData(parsedJson);
    
    // Return normalized payload
    return {
        metadata: metadata,
        data: data,
        raw: rawJsonString
    };
}

/**
 * [{@link RequestParser}]
 *
 * Validates the structure of an HTTP request event from Google Apps Script.
 * Ensures all required fields are present and have correct types.
 *
 * @param {*} httpEvent - The HTTP event object to validate.
 * @returns {HttpRequestEvent} - The validated HTTP event.
 * @throws {HttpEventError} - If the event structure is invalid.
 */
function validateHttpEventStructure(httpEvent) {
    // Validate event object exists and is an object
    if (!httpEvent || typeof httpEvent !== 'object') {
        throw createHttpEventError(
            "Invalid HTTP event: event object is null or not an object",
            "/",
            "object",
            httpEvent === null ? "null" : typeof httpEvent
        );
    }

    // Check if this is a POST request with postData
    if (!httpEvent.postData || typeof httpEvent.postData !== 'object') {
        const actualType = httpEvent.postData === null ? "null" : typeof httpEvent.postData;
        throw createHttpEventError(
            "Invalid HTTP event: postData is required for POST requests",
            "/postData",
            "object",
            actualType
        );
    }

    // Validate postData.contents
    const postData = httpEvent.postData;
    if (typeof postData.contents !== 'string') {
        throw createHttpEventError(
            "Invalid HTTP event: postData.contents must be a string",
            "/postData/contents",
            "string",
            typeof postData.contents
        );
    }

    // Validate content is not empty
    if (postData.contents.length === 0) {
        throw createHttpEventError(
            "Invalid HTTP event: empty request body",
            "/postData/contents",
            "non-empty string",
            "empty string"
        );
    }

    return httpEvent;
}

/**
 * [{@link RequestParser}]
 * 
 * Safe JSON.parse wrapper with enhanced error diagnostics.
 *
 * Behavior:
 * - Validates input is a string.
 * - Attempts to parse the JSON string using standard JSON.parse.
 * - Returns the parsed value or throws a ParsingError with detailed context.
 * - Provides line/column information for syntax errors when possible.
 *
 * @param {string} rawJson - Raw JSON string to parse.
 * @returns {Object|Array} - Parsed JavaScript value (object/array).
 * @throws {ParsingError} - When JSON parsing fails with diagnostic information.
 */
function parseJsonSafe(rawJson) {
    // Validate input type
    if (typeof rawJson !== 'string') {
        throw createParsingError(
            "Invalid input: raw JSON must be a string",
            "/",
            { expectedType: "string", actualType: typeof rawJson }
        );
    }

    // Check for empty or whitespace-only string
    if (rawJson.trim().length === 0) {
        throw createParsingError(
            "Invalid JSON: empty or whitespace-only string",
            "/",
            { inputLength: rawJson.length, trimmedLength: rawJson.trim().length }
        );
    }

    try {
        // Attempt to parse JSON
        const parsed = JSON.parse(rawJson);
        
        // Validate that the result is an object or array
        if (parsed === null || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
            throw createParsingError(
                `Invalid JSON: root must be an object or array, got ${parsed === null ? 'null' : typeof parsed}`,
                "/",
                { 
                    expectedType: "object or array", 
                    actualType: parsed === null ? 'null' : typeof parsed,
                    actualValue: parsed 
                }
            );
        }
        
        return parsed;
    } catch (error) {
        // Handle our own validation errors
        if (error.errorType === 'PARSING_ERROR') {
            throw error;
        }
        
        // Handle JSON.parse syntax errors with enhanced diagnostics
        if (error.name === 'SyntaxError') {
            const diagnostics = extractJsonErrorDiagnostics(error.message, rawJson);
            
            throw createParsingError(
                `JSON syntax error: ${error.message}${diagnostics.positionText}`,
                "/",
                {
                    line: diagnostics.line,
                    column: diagnostics.column,
                    position: diagnostics.position,
                    originalError: error.message
                }
            );
        }
        
        // Handle other unexpected errors
        const errorMessage = error.message || error.toString();
        throw createParsingError(
            `JSON parsing failed: ${errorMessage}`,
            "/",
            { originalError: errorMessage }
        );
    }
}

/**
 * [{@link RequestParser}]
 *
 * Extracts position information from JSON syntax error messages.
 * Helper function for parseJsonSafe to provide better error diagnostics.
 *
 * @param {string} errorMessage - The JSON.parse error message.
 * @param {string} rawJson - The original JSON string.
 * @returns {Object} - Diagnostic information with line, column, and position.
 */
function extractJsonErrorDiagnostics(errorMessage, rawJson) {
    // Try to extract position information from error message
    const match = errorMessage.match(/at position (\d+)/);
    const position = match ? parseInt(match[1]) : null;
    
    let line = 1;
    let column = 1;
    let positionText = '';
    
    if (position !== null && position >= 0 && position <= rawJson.length) {
        // Calculate line and column from position
        const lines = rawJson.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
        positionText = ` (line ${line}, column ${column})`;
    }
    
    return {
        line: line,
        column: column,
        position: position,
        positionText: positionText
    };
}

/**
 * [{@link RequestParser}]
 * 
 * Extracts and validates $spreadsheet metadata and $data from parsed JSON.
 * 
 * Behavior:
 * - Validates the JSON structure contains required $spreadsheet and $data fields.
 * - Performs schema validation on the $spreadsheet metadata.
 * - Applies normalization to the metadata through helper functions.
 * - Returns separated metadata and data objects.
 *
 * @param {Object} parsedJson - Parsed JSON object from parseJsonSafe.
 * @returns {MetadataExtractionResult} - Metadata and data separated and validated.
 * @throws {ValidationError|SchemaValidationError} - When structure or schema validation fails.
 */
function extractSpreadsheetAndData(parsedJson) {
    // Validate input is an object (not array or primitive)
    if (!parsedJson || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        throw createValidationError(
            "Invalid JSON structure: root must be an object",
            "/"
        );
    }

    // Check for required $spreadsheet metadata
    if (!parsedJson.hasOwnProperty('$spreadsheet')) {
        throw createValidationError(
            "Missing required '$spreadsheet' metadata object",
            "/$spreadsheet"
        );
    }

    // Check for required $data
    if (!parsedJson.hasOwnProperty('$data')) {
        throw createValidationError(
            "Missing required '$data' object",
            "/$data"
        );
    }

    const spreadsheetMeta = parsedJson['$spreadsheet'];
    const data = parsedJson['$data'];

    // Validate $spreadsheet is an object
    if (!spreadsheetMeta || typeof spreadsheetMeta !== 'object' || Array.isArray(spreadsheetMeta)) {
        throw createValidationError(
            "Invalid '$spreadsheet': must be an object",
            "/$spreadsheet"
        );
    }

    // Validate $data exists (can be any JSON value except undefined)
    if (data === undefined) {
        throw createValidationError(
            "Invalid '$data': value is undefined",
            "/$data"
        );
    }

    // Validate schema version before proceeding
    validateSchemaVersion(spreadsheetMeta);

    // Apply normalization and validation to metadata
    const normalizedMetadata = normalizeSpreadsheetMetadata(spreadsheetMeta);

    return {
        metadata: normalizedMetadata,
        data: data
    };
}

/**
 * [{@link RequestParser}]
 *
 * Validates the schema version in spreadsheet metadata.
 * Ensures the version exists, is a string, and matches expected format.
 *
 * @param {Object} spreadsheetMeta - The $spreadsheet metadata object.
 * @throws {SchemaValidationError} - If schema version is missing or invalid.
 */
function validateSchemaVersion(spreadsheetMeta) {
    // Check for required schema version field
    if (!spreadsheetMeta.schemaVersion) {
        throw createSchemaValidationError(
            "Missing 'schemaVersion' in $spreadsheet metadata",
            "/$spreadsheet/schemaVersion",
            "schemaVersion",
            "spreadsheet-render-X.Y",
            undefined
        );
    }

    // Validate schema version type
    if (typeof spreadsheetMeta.schemaVersion !== 'string') {
        throw createSchemaValidationError(
            "Invalid 'schemaVersion' type in $spreadsheet metadata",
            "/$spreadsheet/schemaVersion",
            "schemaVersion",
            "string",
            typeof spreadsheetMeta.schemaVersion
        );
    }

    // Validate schema version format
    const versionPattern = /^spreadsheet-render-\d+\.\d+$/;
    if (!versionPattern.test(spreadsheetMeta.schemaVersion)) {
        throw createSchemaValidationError(
            "Invalid schemaVersion format. Expected 'spreadsheet-render-X.Y'",
            "/$spreadsheet/schemaVersion",
            "schemaVersion",
            "spreadsheet-render-X.Y",
            spreadsheetMeta.schemaVersion
        );
    }
}

/**
 * [{@link RequestParser}]
 *
 * Normalizes and validates spreadsheet metadata structure.
 * Ensures required defaults exist and applies legacy coercion if needed.
 * 
 * Behavior:
 * - Creates a deep copy of the raw metadata to avoid mutations.
 * - Ensures all required default sections exist with proper structure.
 * - Validates and normalizes the mappings array.
 * - Applies sensible default values for common properties.
 * - Returns fully normalized metadata ready for use by the rendering engine.
 * 
 * @param {Object} rawMetadata - Raw $spreadsheet object from the request.
 * @returns {SpreadsheetMetadata} - Normalized metadata with guaranteed defaults.
 * @throws {ValidationError|SchemaValidationError} - If critical metadata is invalid.
 */
function normalizeSpreadsheetMetadata(rawMetadata) {
    // Create a deep copy to avoid mutating the original
    const normalized = JSON.parse(JSON.stringify(rawMetadata));

    // Ensure and validate defaults object
    normalized.defaults = ensureDefaultsObject(normalized.defaults);
    
    // Ensure and validate mappings array
    normalized.mappings = ensureMappingsArray(normalized.mappings);
    
    // Validate mappings structure if any exist
    if (normalized.mappings.length > 0) {
        validateMappingsStructure(normalized.mappings);
    }
    
    // Apply default values for common properties
    applyDefaultValues(normalized.defaults);
    
    // Ensure pathSyntax exists with defaults
    ensurePathSyntax(normalized);

    return normalized;
}

/**
 * [{@link RequestParser}]
 *
 * Ensures the defaults object exists and has the required structure.
 * Creates missing sections with empty objects.
 *
 * @param {*} defaults - The defaults value from raw metadata.
 * @returns {SpreadsheetDefaults} - Validated defaults object.
 */
function ensureDefaultsObject(defaults) {
    // Ensure defaults object exists
    if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) {
        defaults = {};
    }

    // Ensure required default sections exist
    const requiredSections = [
        'sheet', 
        'cellStyle', 
        'headerStyle', 
        'typeDefaults', 
        'globalHeader'
    ];

    requiredSections.forEach(section => {
        if (!defaults[section] || typeof defaults[section] !== 'object' || Array.isArray(defaults[section])) {
            defaults[section] = {};
        }
    });

    return defaults;
}

/**
 * [{@link RequestParser}]
 *
 * Ensures the mappings array exists and has the correct type.
 * Converts invalid values to empty array.
 *
 * @param {*} mappings - The mappings value from raw metadata.
 * @returns {Array<MappingSpec>} - Validated mappings array.
 */
function ensureMappingsArray(mappings) {
    // Ensure mappings is an array
    if (!mappings || !Array.isArray(mappings)) {
        return [];
    }
    
    return mappings;
}

/**
 * [{@link RequestParser}]
 *
 * Validates the structure of mapping specifications.
 * Ensures each mapping has required properties with correct types.
 *
 * @param {Array<MappingSpec>} mappings - Array of mapping specifications.
 * @throws {SchemaValidationError} - If any mapping has invalid structure.
 */
function validateMappingsStructure(mappings) {
    mappings.forEach((mapping, index) => {
        const basePath = `/$spreadsheet/mappings/${index}`;
        
        // Validate mapping is an object
        if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
            const actualType = Array.isArray(mapping) ? "array" : typeof mapping;
            throw createSchemaValidationError(
                `Invalid mapping at index ${index}: must be an object`,
                basePath,
                "mapping",
                "object",
                actualType
            );
        }
        
        // Validate required 'id' property
        if (!mapping.id || typeof mapping.id !== 'string') {
            throw createSchemaValidationError(
                `Invalid mapping at index ${index}: missing or invalid 'id' property`,
                `${basePath}/id`,
                "id",
                "non-empty string",
                mapping.id
            );
        }
        
        // Validate required 'path' property
        if (!mapping.path || typeof mapping.path !== 'string') {
            throw createSchemaValidationError(
                `Invalid mapping at index ${index}: missing or invalid 'path' property`,
                `${basePath}/path`,
                "path",
                "non-empty string",
                mapping.path
            );
        }
    });
}

/**
 * [{@link RequestParser}]
 *
 * Determines if a display default value should be applied.
 * A default is applied if the property doesn't exist OR if it's falsy but not an empty string.
 *
 * @param {Object} defaults - The defaults object.
 * @param {string} propertyName - The name of the property to check.
 * @returns {boolean} - True if the default should be applied.
 */
function shouldApplyDisplayDefault(defaults, propertyName) {
    if (!defaults.hasOwnProperty(propertyName)) {
        return true;
    }
    
    const value = defaults[propertyName];
    // Apply default if value is falsy but not empty string (empty string is a valid display value)
    return (value !== '' && !value);
}

/**
 * [{@link RequestParser}]
 *
 * Applies default values for commonly used properties in spreadsheet defaults.
 * Sets sensible defaults for display and formatting options.
 *
 * @param {SpreadsheetDefaults} defaults - The defaults object to populate.
 */
function applyDefaultValues(defaults) {
    // Set number precision threshold if not specified
    if (defaults.numberPrecisionThreshold === undefined) {
        defaults.numberPrecisionThreshold = 9007199254740991; // Number.MAX_SAFE_INTEGER
    }

    // Set display defaults for various empty/null states
    if (shouldApplyDisplayDefault(defaults, 'nullDisplay')) {
        defaults.nullDisplay = "";
    }

    if (shouldApplyDisplayDefault(defaults, 'emptyArrayDisplay')) {
        defaults.emptyArrayDisplay = "[empty array]";
    }

    if (shouldApplyDisplayDefault(defaults, 'emptyObjectDisplay')) {
        defaults.emptyObjectDisplay = "{ }";
    }

    if (shouldApplyDisplayDefault(defaults, 'emptyStringDisplay')) {
        defaults.emptyStringDisplay = "";
    }
}

/**
 * [{@link RequestParser}]
 *
 * Ensures pathSyntax configuration exists with appropriate defaults.
 * Sets default path syntax type if not specified.
 *
 * @param {SpreadsheetMetadata} metadata - The metadata object to update.
 */
function ensurePathSyntax(metadata) {
    // Ensure pathSyntax exists with defaults
    if (!metadata.pathSyntax || typeof metadata.pathSyntax !== 'object' || Array.isArray(metadata.pathSyntax)) {
        metadata.pathSyntax = {
            type: "json-pointer-wildcard"
        };
    }
    
    // Ensure pathSyntax has a type if not specified
    if (!metadata.pathSyntax.type) {
        metadata.pathSyntax.type = "json-pointer-wildcard";
    }
}

// Import error factory functions (for Google Apps Script compatibility)
// In a real implementation, these would be imported, but for GAS we include them here
// or load them from the AppErrorTypes.js file

/**
 * Normalizes a JSON-Pointer path, ensuring it defaults to root if not provided.
 * @param {string} [path] - Optional JSON-Pointer path.
 * @returns {string} - Normalized path, defaulting to "/" for root.
 */
function normalizeErrorPath(path) {
    return path || "/";
}

/**
 * Creates a standardized validation error.
 * @param {string} message - Error message.
 * @param {string} [path="/"] - JSON-Pointer path to the error location.
 * @returns {ValidationError} - Structured validation error.
 */
function createValidationError(message, path) {
    return {
        message: message,
        path: normalizeErrorPath(path),
        errorType: "VALIDATION_ERROR"
    };
}

/**
 * Creates a standardized parsing error with diagnostic details.
 * @param {string} message - Error message.
 * @param {string} [path="/"] - JSON-Pointer path where parsing failed.
 * @param {Object} [details] - Additional parsing context.
 * @returns {ParsingError} - Structured parsing error.
 */
function createParsingError(message, path, details) {
    return {
        message: message,
        path: normalizeErrorPath(path),
        errorType: "PARSING_ERROR",
        details: details
    };
}

/**
 * Creates a standardized HTTP event validation error.
 * @param {string} message - Error message.
 * @param {string} path - JSON-Pointer path to the problematic field.
 * @param {string} [expectedType] - Expected data type.
 * @param {string} [actualType] - Actual data type found.
 * @returns {HttpEventError} - Structured HTTP event error.
 */
function createHttpEventError(message, path, expectedType, actualType) {
    return {
        message: message,
        path: path,
        errorType: "HTTP_EVENT_ERROR",
        expectedType: expectedType,
        actualType: actualType
    };
}

/**
 * Creates a standardized schema validation error.
 * @param {string} message - Error message.
 * @param {string} path - JSON-Pointer path to the invalid field.
 * @param {string} [fieldName] - Name of the field that failed.
 * @param {*} [expectedValue] - Expected value or format.
 * @param {*} [actualValue] - Actual value that caused the error.
 * @returns {SchemaValidationError} - Structured schema validation error.
 */
function createSchemaValidationError(message, path, fieldName, expectedValue, actualValue) {
    return {
        message: message,
        path: path,
        errorType: "SCHEMA_VALIDATION_ERROR",
        fieldName: fieldName,
        expectedValue: expectedValue,
        actualValue: actualValue
    };
}
