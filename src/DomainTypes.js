/**
 * Top-level placeholder to Mimic Google Apps Script typedefs (for documentation).
 * 
 * - {@link GoogleAppsScript} - Top-level namespace for Google Apps Script.
 * - {@link GoogleAppsScript.Events.HttpRequestEvent} - Event object for HTTP requests.
 * - {@link GoogleAppsScript.Content.TextOutput} - Text output object for HTTP responses.
 * - {@link GoogleAppsScript.Html.HtmlOutput} - HTML output object for HTTP responses.
 * 
 * @namespace GoogleAppsScript
 */

/**
 * [{@link GoogleAppsScript}]
 * 
 * Event object passed to Apps Script web apps for both GET and POST requests.
 *
 * Official reference: {@link https://developers.google.com/apps-script/guides/web#request_parameters}
 *
 * @typedef {Object} GoogleAppsScript.Events.HttpRequestEvent
 *
 * @property {string|null} [queryString] - The value of the query string portion of the URL, or null if none.
 *   @example "name=alice&n=1&n=2"
 *
 * @property {Object.<string,string>} [parameter] - Object of key/value pairs.
 *   Only the first value is returned for parameters with multiple values.
 *   @example {"name": "alice", "n": "1"}
 *
 * @property {Object.<string,string[]>} [parameters] - Object of key → array of values.
 *   @example {"name": ["alice"], "n": ["1", "2"]}
 *
 * @property {string} [pathInfo] - The URL path after /exec or /dev.
 *   For example, if the URL ends in /exec/hello, then pathInfo is "hello".
 *
 * @property {string} [contextPath] - Always the empty string (not used).
 *
 * @property {number} [contentLength] - The length of the request body for POST, or -1 for GET.
 *   @example 332
 *
 * @property {GoogleAppsScript.Events.HttpRequestEvent.PostData} [postData] - Present only for POST requests. Contains the body of the request.
 */

/**
 * [{@link GoogleAppsScript.Events.HttpRequestEvent}]
 * 
 * Contains the body of the POST request.
 *
 * @typedef {Object} GoogleAppsScript.Events.HttpRequestEvent.PostData
 * @property {number} length - The same as contentLength. The length of the request body.
 *   @example 332
 * @property {string} type - The MIME type of the POST body.
 *   @example "text/csv"
 * @property {string} contents - The content text of the POST body.
 *   @example "Alice,21"
 * @property {string} name - Always the value "postData".
 *   @example "postData"
 */

/**
 * [{@link GoogleAppsScript}]
 *
 * Minimal placeholder typedef for ContentService.TextOutput.
 * We don't re-implement all methods here — we only declare the type so that
 * we have a symbol it can link. The @see points to the official docs.
 * @see https://developers.google.com/apps-script/reference/content/text-output
 *
 * @typedef {Object} GoogleAppsScript.Content.TextOutput
 */

/**
 * [{@link GoogleAppsScript}]
 * 
 * Minimal placeholder typedef for HtmlService.HtmlOutput.
 * We don't re-implement all methods here — we only declare the type so that
 * we have a symbol it can link. The @see points to the official docs.
 * @see https://developers.google.com/apps-script/reference/html/html-output
 *
 * @typedef {Object} GoogleAppsScript.Html.HtmlOutput
 */

/**
 * Core application type definitions used throughout the system.
 * 
 * - {@link ParsedPayload} - Parsed payload object for incoming HTTP requests.
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
 * Parsed payload object for incoming HTTP requests.
 * @typedef {Object} ParsedPayload
 * @property {Object} metadata - Normalized `$spreadsheet` metadata object.
 * @property {Object} data - Normalized `$data` object containing the actual JSON values.
 * @property {string} raw - The original raw JSON string received over HTTP.
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

/**
 * Error type definitions for application error handling.
 * 
 * - {@link ValidationError} - Validation error returned by the validation engine.
 * - {@link MappingError} - Mapping error returned by the mapping engine.
 * - {@link RenderError} - Render error returned by the rendering engine.
 * 
 * @namespace AppErrorTypes
 * 
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Validation error returned by the validation engine.
 * @typedef {Object} ValidationError
 * @param {string} message - Error message.
 * @param {string} [path] - JSON-Pointer path to the invalid value.
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Mapping error returned by the mapping engine.
 * @typedef {Object} MappingError
 * @param {string} message - Error message.
 * @param {string} [mappingId] - ID of the mapping that failed.
 */

/**
 * [{@link AppErrorTypes}]
 *
 * Render error returned by the rendering engine.
 * @typedef {Object} RenderError
 * @param {string} message
 * @param {string} [dataPath]
 * @param {Error} [cause]
 */
