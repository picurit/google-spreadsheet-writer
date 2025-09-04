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
