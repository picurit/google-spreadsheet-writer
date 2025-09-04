/**
 * Core application type definitions used throughout the system.
 * 
 * - {@link ParsedPayload} - Parsed payload object for incoming HTTP requests.
 * - {@link HttpRequestEvent} - Google Apps Script HTTP request event structure.
 * - {@link PostData} - HTTP POST data structure from Google Apps Script.
 * - {@link SpreadsheetMetadata} - Spreadsheet configuration metadata structure.
 * - {@link SpreadsheetDefaults} - Default values for spreadsheet rendering.
 * - {@link JsonParseResult} - Result of JSON parsing operations.
 * - {@link MetadataExtractionResult} - Result of metadata extraction from JSON.
 * - {@link RendererContext} - Context object for renderers and managers.
 * - {@link MappingSpec} - Mapping specification for JSON mapping.
 * - {@link ColumnSpec} - Column specification for table rendering.
 * - {@link NumberFormatSpec} - Number format specification for table cells.
 * - {@link StyleSpec} - Style specification for table cells.
 * - {@link MatchCandidate} - Match candidate object for mapping.
 * - {@link RenderResult} - Result object returned by rendering engine.
 * - {@link GetOrCreateSheetOptions} - Options for getOrCreateSheet.
 * - {@link OpenSpreadsheetOptions} - Options for openSpreadsheet.
 * 
 * @namespace AppSharedTypes
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Google Apps Script HTTP request event structure.
 * @typedef {Object} HttpRequestEvent
 * @property {PostData} postData - POST request data containing the request body.
 * @property {string} [method] - HTTP method (usually 'POST').
 * @property {Object} [parameter] - URL parameters.
 * @property {Object} [pathInfo] - Additional path information.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * HTTP POST data structure from Google Apps Script.
 * @typedef {Object} PostData
 * @property {string} contents - Raw request body as string.
 * @property {string} [type] - Content type of the request.
 * @property {string} [name] - Parameter name if multipart.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Parsed payload object for incoming HTTP requests.
 * @typedef {Object} ParsedPayload
 * @property {SpreadsheetMetadata} metadata - Normalized `$spreadsheet` metadata object.
 * @property {Object} data - Normalized `$data` object containing the actual JSON values.
 * @property {string} raw - The original raw JSON string received over HTTP.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Result of JSON parsing operations with metadata.
 * @typedef {Object} JsonParseResult
 * @property {Object} parsed - Successfully parsed JSON object or array.
 * @property {string} rawJson - Original JSON string that was parsed.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Result of metadata extraction from parsed JSON.
 * @typedef {Object} MetadataExtractionResult
 * @property {SpreadsheetMetadata} metadata - Normalized spreadsheet metadata.
 * @property {Object} data - Extracted data portion of the payload.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Spreadsheet configuration metadata structure.
 * @typedef {Object} SpreadsheetMetadata
 * @property {string} schemaVersion - Schema version identifier (e.g., 'spreadsheet-render-1.0').
 * @property {SpreadsheetDefaults} defaults - Default rendering configuration.
 * @property {Array<MappingSpec>} mappings - Array of mapping specifications.
 * @property {Object} [pathSyntax] - Path syntax configuration.
 * @property {string} [pathSyntax.type] - Path syntax type (e.g., 'json-pointer-wildcard').
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Default values and configurations for spreadsheet rendering.
 * @typedef {Object} SpreadsheetDefaults
 * @property {Object} sheet - Sheet-level defaults.
 * @property {Object} cellStyle - Default cell styling.
 * @property {Object} headerStyle - Default header styling.
 * @property {Object} typeDefaults - Type-specific defaults.
 * @property {Object} globalHeader - Global header configuration.
 * @property {number} [numberPrecisionThreshold] - Threshold for number precision.
 * @property {string} [nullDisplay] - Display value for null fields.
 * @property {string} [emptyArrayDisplay] - Display value for empty arrays.
 * @property {string} [emptyObjectDisplay] - Display value for empty objects.
 * @property {string} [emptyStringDisplay] - Display value for empty strings.
 */

/**
 * [{@link AppSharedTypes}]
 * 
 * Dependency Injection container passed to renderers and managers.
 * @typedef {Object} RendererContext
 * @property {SheetManager} sheetManager - Sheet lifecycle manager.
 * @property {TransformRegistry} transformRegistry - Transform registry and invoker.
 * @property {StyleResolver} styleResolver - Style computation + applier.
 * @property {Formatter} formatter - Number/date formatter utility.
 * @property {CellWriter} cellWriter - Low-level cell writer helper.
 * @property {AppLogger} logger - Structured logger.
 * @property {Object} config - System-wide configuration (from Config.DEFAULTS).
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Mapping specification for JSON mapping.
 * @typedef {Object} MappingSpec
 * @property {string} id - Unique mapping id.
 * @property {string} path - JSON-Pointer pattern (may include '*' and '**').
 * @property {string} match - Match mode: 'exact'|'prefix'|'type-pattern'|'recursive-wildcard' etc.
 * @property {string} [description] - Optional human-friendly description.
 * @property {Object} [display] - Display instruction object (see specific display typedefs).
 * @property {Object} [behaviorHints] - Optional hints to rendering engine.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Column specification for table rendering.
 * @typedef {Object} ColumnSpec
 * @property {string} [path] - JSON-Pointer to a value which will populate this column.
 * @property {string} header - Header label to show in the table.
 * @property {string} [type] - Type hint: 'string'|'number'|'boolean'|'date'|'array'|'object'.
 * @property {NumberFormatSpec|Object} [numberFormat] - Structured number/date format metadata.
 * @property {Object} [cellStyle] - Partial style override to pass to StyleResolver.
 * @property {number} [width] - Column width in pixels.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Number format specification for table cells.
 * @typedef {Object} NumberFormatSpec
 * @property {string} type - 'TEXT' | 'NUMBER' | 'DATE' | 'DATE_TIME' | 'PERCENT' etc.
 * @property {string} [pattern] - Pattern string used to build Sheets number format.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Style specification for table cells.
 * @typedef {Object} StyleSpec
 * @property {string} [fontFamily]
 * @property {number} [fontSize]
 * @property {boolean} [bold]
 * @property {boolean} [italic]
 * @property {boolean} [wrap]
 * @property {string} [horizontalAlign] - 'LEFT'|'CENTER'|'RIGHT'
 * @property {string} [verticalAlign] - 'TOP'|'MIDDLE'|'BOTTOM'
 * @property {string} [textColor] - CSS hex color
 * @property {string} [backgroundColor] - CSS hex color
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Match candidate returned by MappingEngine.matchCandidates()
 * @typedef {Object} MatchCandidate
 * @property {MappingSpec} mapping - The original mapping object that matched.
 * @property {string} matchType - e.g. 'exact'|'prefix'|'wildcard'|'recursive'.
 * @property {number} specificityScore - Computed specificity used for ranking.
 * @property {Object} captures - Data extracted from wildcard captures (if any).
 */

/**
 * [{@link AppSharedTypes}]
 * 
 * Render result returned by RendererController.render
 * @typedef {Object} RenderResult
 * @property {string} spreadsheetId - ID of the spreadsheet written to.
 * @property {number} sheetsWritten - Number of individual sheets created/updated.
 * @property {Array<Object>} warnings - Non-fatal warnings produced during render.
 * @property {Array<Object>} [errors] - Non-throwing list of fatal errors if the engine was configured to continue on errors.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Options bag for getOrCreateSheet
 * @typedef {Object} GetOrCreateSheetOptions
 * @property {boolean} [clearExisting=false] - If true, clear existing sheet contents.
 * @property {boolean} [allowRename=false] - If true, will attempt to rename existing conflicting sheet.
 */

/**
 * [{@link AppSharedTypes}]
 *
 * Options bag for opening spreadsheets
 * @typedef {Object} OpenSpreadsheetOptions
 * @property {boolean} [createIfMissing=false] - Create a new spreadsheet when idOrUrl is a blank value.
 * @property {string} [title] - Title to use when creating a new spreadsheet.
 */
