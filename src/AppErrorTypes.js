/**
 * Error type definitions for application error handling.
 * 
 * - {@link ValidationError} - Validation error returned by the validation engine.
 * - {@link ParsingError} - Parsing error returned by JSON parsing functions.
 * - {@link HttpEventError} - HTTP event validation error.
 * - {@link SchemaValidationError} - Schema validation error with detailed context.
 * - {@link MappingError} - Mapping error returned by the mapping engine.
 * - {@link RenderError} - Render error returned by the rendering engine.
 * 
 * @namespace AppErrorTypes
 * 
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Base validation error returned by the validation engine.
 * @typedef {Object} ValidationError
 * @property {string} message - Error message describing what went wrong.
 * @property {string} [path] - JSON-Pointer path to the invalid value.
 * @property {string} [errorType] - Specific error type for categorization.
 */

/**
 * [{@link AppErrorTypes}]
 *
 * JSON parsing error with enhanced diagnostic information.
 * @typedef {Object} ParsingError
 * @property {string} message - Error message describing the parsing failure.
 * @property {string} path - JSON-Pointer path where parsing failed.
 * @property {string} errorType - Always 'PARSING_ERROR' for identification.
 * @property {Object} [details] - Additional parsing context.
 * @property {number} [details.line] - Line number where error occurred.
 * @property {number} [details.column] - Column number where error occurred.
 * @property {number} [details.position] - Character position where error occurred.
 */

/**
 * [{@link AppErrorTypes}]
 *
 * HTTP event structure validation error.
 * @typedef {Object} HttpEventError
 * @property {string} message - Error message describing the HTTP event issue.
 * @property {string} path - JSON-Pointer path to the problematic field.
 * @property {string} errorType - Always 'HTTP_EVENT_ERROR' for identification.
 * @property {string} [expectedType] - Expected data type or structure.
 * @property {string} [actualType] - Actual data type found.
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Schema validation error with enhanced context.
 * @typedef {Object} SchemaValidationError
 * @property {string} message - Error message describing the schema violation.
 * @property {string} path - JSON-Pointer path to the invalid field.
 * @property {string} errorType - Always 'SCHEMA_VALIDATION_ERROR' for identification.
 * @property {string} [fieldName] - Name of the field that failed validation.
 * @property {*} [expectedValue] - Expected value or format.
 * @property {*} [actualValue] - Actual value that caused the error.
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Mapping error returned by the mapping engine.
 * @typedef {Object} MappingError
 * @property {string} message - Error message.
 * @property {string} [mappingId] - ID of the mapping that failed.
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Render error returned by the rendering engine.
 * @typedef {Object} RenderError
 * @property {string} message
 * @property {string} [dataPath]
 * @property {Error} [cause]
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Error factory functions for consistent error creation.
 * @namespace ErrorFactory
 */

/**
 * [{@link AppErrorTypes}] [{@link ErrorFactory}]
 *
 * Creates a standardized validation error.
 * @param {string} message - Error message.
 * @param {string} [path="/"] - JSON-Pointer path to the error location.
 * @returns {ValidationError} - Structured validation error.
 */
function createValidationError(message, path) {
    return {
        message: message,
        path: path || "/",
        errorType: "VALIDATION_ERROR"
    };
}

/**
 * [{@link AppErrorTypes}] [{@link ErrorFactory}]
 *
 * Creates a standardized parsing error with diagnostic details.
 * @param {string} message - Error message.
 * @param {string} [path="/"] - JSON-Pointer path where parsing failed.
 * @param {Object} [details] - Additional parsing context.
 * @returns {ParsingError} - Structured parsing error.
 */
function createParsingError(message, path, details) {
    return {
        message: message,
        path: path || "/",
        errorType: "PARSING_ERROR",
        details: details
    };
}

/**
 * [{@link AppErrorTypes}] [{@link ErrorFactory}]
 *
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
 * [{@link AppErrorTypes}] [{@link ErrorFactory}]
 *
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
