/**
 * Parsing & request normalization utilities.
 * Parses raw HTTP body into {@link ParsedPayload} object.
 *
 * - {@link parseHttpEvent} - Parses an Apps Script HTTP event into a normalized payload.
 * - {@link parseJsonSafe} - Safe wrapper for JSON.parse with error handling.
 * - {@link extractSpreadsheetAndData} - Extracts $spreadsheet and $data from parsed JSON.
 * - {@link normalizeSpreadsheetMetadata} - Normalizes and validates spreadsheet metadata.
 *
 * @namespace RequestParser
 */

/**
 * [{@link RequestParser}]
 *
 * Safely parse an Apps Script HTTP event into a normalized parsed payload.
 * 
 * Behavior:
 * - Receives an standard Apps Script HTTP POST event object.
 * - Extracts and validates the POST body.
 * - Returns a normalized payload for further processing or throws a ValidationError.
 *
 * @param {GoogleAppsScript.Events.HttpRequestEvent} e - Apps Script HTTP POST event object.
 * @returns {ParsedPayload} - Normalized payload to be used in the application.
 * @throws {ValidationError} - If parsing or validation fails (with diagnostic info).
 */
function parseHttpEvent(e) {
    // Validate basic event structure
    if (!e || typeof e !== 'object') {
        throw {
            message: "Invalid HTTP event: event object is null or not an object",
            path: "/"
        };
    }

    // Check if this is a POST request with postData
    if (!e.postData || typeof e.postData !== 'object') {
        throw {
            message: "Invalid HTTP event: postData is required for POST requests",
            path: "/postData"
        };
    }

    // Validate postData structure
    const postData = e.postData;
    if (typeof postData.contents !== 'string') {
        throw {
            message: "Invalid HTTP event: postData.contents must be a string",
            path: "/postData/contents"
        };
    }

    // Get raw JSON string from post body
    const rawJsonString = postData.contents;
    
    // Validate content length
    if (rawJsonString.length === 0) {
        throw {
            message: "Invalid HTTP event: empty request body",
            path: "/postData/contents"
        };
    }

    // Parse the JSON safely
    const parsedJson = parseJsonSafe(rawJsonString);
    
    // Extract spreadsheet metadata and data
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
 * Safe JSON.parse wrapper that returns helpful diagnostics
 *
 * Behavior:
 * - Attempts to parse the JSON string using standard JSON.parse.
 * - Returns the parsed value or throws a ValidationError with details.
 *
 * @param {string} raw - Raw JSON string.
 * @returns {Object} - Parsed JavaScript value (object/array).
 * @throws {ValidationError} - When JSON.parse fails. Implementations should include line/column hints where possible.
 */
function parseJsonSafe(raw) {
    // Validate input
    if (typeof raw !== 'string') {
        throw {
            message: "Invalid input: raw must be a string",
            path: "/"
        };
    }

    // Check for empty string
    if (raw.trim().length === 0) {
        throw {
            message: "Invalid JSON: empty or whitespace-only string",
            path: "/"
        };
    }

    try {
        // Attempt to parse JSON
        const parsed = JSON.parse(raw);
        
        // Validate that the result is an object or array
        if (parsed === null || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
            throw {
                message: "Invalid JSON: root must be an object or array, got " + (parsed === null ? 'null' : typeof parsed),
                path: "/"
            };
        }
        
        return parsed;
    } catch (error) {
        // Handle JSON.parse errors
        if (error.name === 'SyntaxError') {
            // Try to extract line/column information if available
            const match = error.message.match(/at position (\d+)/);
            let position = match ? parseInt(match[1]) : null;
            
            // Calculate approximate line and column
            let line = 1;
            let column = 1;
            
            if (position !== null) {
                const lines = raw.substring(0, position).split('\n');
                line = lines.length;
                column = lines[lines.length - 1].length + 1;
            }
            
            throw {
                message: `JSON syntax error: ${error.message}${position !== null ? ` (line ${line}, column ${column})` : ''}`,
                path: "/",
                details: {
                    line: line,
                    column: column,
                    position: position
                }
            };
        }
        
        // Re-throw other errors as validation errors
        throw {
            message: "JSON parsing failed: " + (error.message || error.toString()),
            path: "/"
        };
    }
}

/**
 * [{@link RequestParser}]
 * 
 * Behavior:
 * - Extracts `$spreadsheet` metadata and `$data` entries from the given parsed JSON.
 * - Apply minimal validation (ensure defaults object exists, coerce legacy shapes if required).
 * - Returns the extracted metadata and data as separate objects or throws a ValidationError.
 *
 * @param {Object} json - Parsed JSON object.
 * @returns {{ metadata: Object, data: Object }} Metadata and data separated.
 * @throws {ValidationError} Thrown when the body is not valid JSON or `$spreadsheet`/`$data` are missing or of an incorrect type.
 */
function extractSpreadsheetAndData(json) {
    // Validate input is an object
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
        throw {
            message: "Invalid JSON structure: root must be an object",
            path: "/"
        };
    }

    // Check for required $spreadsheet metadata
    if (!json.hasOwnProperty('$spreadsheet')) {
        throw {
            message: "Missing required '$spreadsheet' metadata object",
            path: "/$spreadsheet"
        };
    }

    // Check for required $data
    if (!json.hasOwnProperty('$data')) {
        throw {
            message: "Missing required '$data' object",
            path: "/$data"
        };
    }

    const spreadsheetMeta = json['$spreadsheet'];
    const data = json['$data'];

    // Validate $spreadsheet is an object
    if (!spreadsheetMeta || typeof spreadsheetMeta !== 'object' || Array.isArray(spreadsheetMeta)) {
        throw {
            message: "Invalid '$spreadsheet': must be an object",
            path: "/$spreadsheet"
        };
    }

    // Validate $data exists (can be any JSON value)
    if (data === undefined) {
        throw {
            message: "Invalid '$data': value is undefined",
            path: "/$data"
        };
    }

    // Validate required schema version
    if (!spreadsheetMeta.schemaVersion || typeof spreadsheetMeta.schemaVersion !== 'string') {
        throw {
            message: "Missing or invalid 'schemaVersion' in $spreadsheet metadata",
            path: "/$spreadsheet/schemaVersion"
        };
    }

    // Validate schema version format (basic check)
    if (!spreadsheetMeta.schemaVersion.match(/^spreadsheet-render-\d+\.\d+$/)) {
        throw {
            message: "Invalid schemaVersion format. Expected 'spreadsheet-render-X.Y'",
            path: "/$spreadsheet/schemaVersion"
        };
    }

    // Apply minimal validation and normalization to metadata
    const normalizedMetadata = normalizeSpreadsheetMetadata(spreadsheetMeta);

    return {
        metadata: normalizedMetadata,
        data: data
    };
}

/**
 * Internal helper function to normalize and validate spreadsheet metadata.
 * Ensures required defaults exist and applies legacy coercion if needed.
 * 
 * @param {Object} rawMetadata - Raw $spreadsheet object
 * @returns {Object} - Normalized metadata with guaranteed defaults
 * @throws {ValidationError} - If critical metadata is invalid
 */
function normalizeSpreadsheetMetadata(rawMetadata) {
    const normalized = { ...rawMetadata };

    // Ensure defaults object exists
    if (!normalized.defaults || typeof normalized.defaults !== 'object') {
        normalized.defaults = {};
    }

    // Ensure required default sections exist
    const requiredDefaults = [
        'sheet', 
        'cellStyle', 
        'headerStyle', 
        'typeDefaults', 
        'globalHeader'
    ];

    requiredDefaults.forEach(section => {
        if (!normalized.defaults[section] || typeof normalized.defaults[section] !== 'object') {
            normalized.defaults[section] = {};
        }
    });

    // Ensure mappings array exists
    if (!normalized.mappings || !Array.isArray(normalized.mappings)) {
        normalized.mappings = [];
    }

    // Validate mappings structure (basic validation)
    normalized.mappings.forEach((mapping, index) => {
        if (!mapping || typeof mapping !== 'object') {
            throw {
                message: `Invalid mapping at index ${index}: must be an object`,
                path: `/$spreadsheet/mappings/${index}`
            };
        }
        
        if (!mapping.id || typeof mapping.id !== 'string') {
            throw {
                message: `Invalid mapping at index ${index}: missing or invalid 'id' property`,
                path: `/$spreadsheet/mappings/${index}/id`
            };
        }
        
        if (!mapping.path || typeof mapping.path !== 'string') {
            throw {
                message: `Invalid mapping at index ${index}: missing or invalid 'path' property`,
                path: `/$spreadsheet/mappings/${index}/path`
            };
        }
    });

    // Apply default values for commonly used properties
    if (normalized.defaults.numberPrecisionThreshold === undefined) {
        normalized.defaults.numberPrecisionThreshold = 9007199254740991; // Number.MAX_SAFE_INTEGER
    }

    if (!normalized.defaults.nullDisplay) {
        normalized.defaults.nullDisplay = "";
    }

    if (!normalized.defaults.emptyArrayDisplay) {
        normalized.defaults.emptyArrayDisplay = "[empty array]";
    }

    if (!normalized.defaults.emptyObjectDisplay) {
        normalized.defaults.emptyObjectDisplay = "{ }";
    }

    if (!normalized.defaults.emptyStringDisplay) {
        normalized.defaults.emptyStringDisplay = "";
    }

    // Ensure pathSyntax exists with defaults
    if (!normalized.pathSyntax || typeof normalized.pathSyntax !== 'object') {
        normalized.pathSyntax = {
            type: "json-pointer-wildcard"
        };
    }

    return normalized;
}
