

### Table of Contents

*   [GoogleAppsScript][1]
*   [GoogleAppsScript.Events.HttpRequestEvent][2]
    *   [Properties][3]
    *   [Examples][4]
*   [GoogleAppsScript.Events.HttpRequestEvent.PostData][5]
    *   [Properties][6]
    *   [Examples][7]
*   [GoogleAppsScript.Content.TextOutput][8]
*   [GoogleAppsScript.Html.HtmlOutput][9]
*   [AppSharedTypes][10]
*   [ParsedPayload][11]
    *   [Properties][12]
*   [RendererContext][13]
    *   [Properties][14]
*   [MappingSpec][15]
    *   [Properties][16]
*   [ColumnSpec][17]
    *   [Properties][18]
*   [NumberFormatSpec][19]
    *   [Properties][20]
*   [StyleSpec][21]
    *   [Properties][22]
*   [MatchCandidate][23]
    *   [Properties][24]
*   [RenderResult][25]
    *   [Properties][26]
*   [GetOrCreateSheetOptions][27]
    *   [Properties][28]
*   [OpenSpreadsheetOptions][29]
    *   [Properties][30]
*   [AppErrorTypes][31]
*   [ValidationError][32]
    *   [Parameters][33]
*   [MappingError][34]
    *   [Parameters][35]
*   [RenderError][36]
    *   [Parameters][37]
*   [RequestParser][38]
*   [parseHttpEvent][39]
    *   [Parameters][40]
*   [parseJsonSafe][41]
    *   [Parameters][42]
*   [extractSpreadsheetAndData][43]
    *   [Parameters][44]
*   [SpreadsheetWriter][45]
*   [doPost][46]
    *   [Parameters][47]
    *   [Examples][48]
*   [doGet][49]
    *   [Parameters][50]
    *   [Examples][51]
*   [\_buildContext][52]
    *   [Parameters][53]

## GoogleAppsScript

Top-level placeholder to Mimic Google Apps Script typedefs (for documentation).

*   [GoogleAppsScript][1] - Top-level namespace for Google Apps Script.
*   [GoogleAppsScript.Events.HttpRequestEvent][2] - Event object for HTTP requests.
*   [GoogleAppsScript.Content.TextOutput][8] - Text output object for HTTP responses.
*   [GoogleAppsScript.Html.HtmlOutput][9] - HTML output object for HTTP responses.

## GoogleAppsScript.Events.HttpRequestEvent

\[[GoogleAppsScript][1]]

Event object passed to Apps Script web apps for both GET and POST requests.

Official reference: [https://developers.google.com/apps-script/guides/web#request\_parameters][54]

Type: [Object][55]

### Properties

*   `queryString` **([string][56] | null)?** The value of the query string portion of the URL, or null if none.
*   `parameter` **[Object][55]\<[string][56], [string][56]\>?** Object of key/value pairs.
    Only the first value is returned for parameters with multiple values.
*   `parameters` **[Object][55]\<[string][56], [Array][57]\<[string][56]\>\>?** Object of key → array of values.
*   `pathInfo` **[string][56]?** The URL path after /exec or /dev.
    For example, if the URL ends in /exec/hello, then pathInfo is "hello".
*   `contextPath` **[string][56]?** Always the empty string (not used).
*   `contentLength` **[number][58]?** The length of the request body for POST, or -1 for GET.
*   `postData` **[GoogleAppsScript.Events.HttpRequestEvent.PostData][5]?** Present only for POST requests. Contains the body of the request.

### Examples

```javascript
"name=alice&n=1&n=2"
```

```javascript
\{"name": "alice", "n": "1"\}
```

```javascript
\{"name": ["alice"], "n": ["1", "2"]\}
```

```javascript
332
```

## GoogleAppsScript.Events.HttpRequestEvent.PostData

\[[GoogleAppsScript.Events.HttpRequestEvent][2]]

Contains the body of the POST request.

Type: [Object][55]

### Properties

*   `length` **[number][58]** The same as contentLength. The length of the request body.
*   `type` **[string][56]** The MIME type of the POST body.
*   `contents` **[string][56]** The content text of the POST body.
*   `name` **[string][56]** Always the value "postData".

### Examples

```javascript
332
```

```javascript
"text/csv"
```

```javascript
"Alice,21"
```

```javascript
"postData"
```

## GoogleAppsScript.Content.TextOutput

*   **See**: [https://developers.google.com/apps-script/reference/content/text-output][59]

\[[GoogleAppsScript][1]]

Minimal placeholder typedef for ContentService.TextOutput.
We don't re-implement all methods here — we only declare the type so that
we have a symbol it can link. The @see points to the official docs.

Type: [Object][55]

## GoogleAppsScript.Html.HtmlOutput

*   **See**: [https://developers.google.com/apps-script/reference/html/html-output][60]

\[[GoogleAppsScript][1]]

Minimal placeholder typedef for HtmlService.HtmlOutput.
We don't re-implement all methods here — we only declare the type so that
we have a symbol it can link. The @see points to the official docs.

Type: [Object][55]

## AppSharedTypes

Core application type definitions used throughout the system.

*   [ParsedPayload][11] - Parsed payload object for incoming HTTP requests.
*   [RendererContext][13] - Context object for renderers and managers.
*   [MappingSpec][15] - Mapping specification for JSON mapping.
*   [ColumnSpec][17] - Column specification for table rendering.
*   [NumberFormatSpec][19] - Number format specification for table cells.
*   [StyleSpec][21] - Style specification for table cells.
*   [MatchCandidate][23] - Match candidate object for mapping.
*   [RenderResult][25] - Result object returned by rendering engine.
*   [GetOrCreateSheetOptions][27] - Options for getOrCreateSheet.
*   [OpenSpreadsheetOptions][29] - Options for openSpreadsheet.

## ParsedPayload

\[[AppSharedTypes][10]]

Parsed payload object for incoming HTTP requests.

Type: [Object][55]

### Properties

*   `metadata` **[Object][55]** Normalized `$spreadsheet` metadata object.
*   `data` **[Object][55]** Normalized `$data` object containing the actual JSON values.
*   `raw` **[string][56]** The original raw JSON string received over HTTP.

## RendererContext

\[[AppSharedTypes][10]]

Dependency Injection container passed to renderers and managers.

Type: [Object][55]

### Properties

*   `sheetManager` **SheetManager** Sheet lifecycle manager.
*   `transformRegistry` **TransformRegistry** Transform registry and invoker.
*   `styleResolver` **StyleResolver** Style computation + applier.
*   `formatter` **Formatter** Number/date formatter utility.
*   `cellWriter` **CellWriter** Low-level cell writer helper.
*   `logger` **Logger** Structured logger.
*   `config` **[Object][55]** System-wide configuration (from Config.DEFAULTS).

## MappingSpec

\[[AppSharedTypes][10]]

Mapping specification for JSON mapping.

Type: [Object][55]

### Properties

*   `id` **[string][56]** Unique mapping id.
*   `path` **[string][56]** JSON-Pointer pattern (may include '\*' and '\*\*').
*   `match` **[string][56]** Match mode: 'exact'|'prefix'|'type-pattern'|'recursive-wildcard' etc.
*   `description` **[string][56]?** Optional human-friendly description.
*   `display` **[Object][55]?** Display instruction object (see specific display typedefs).
*   `behaviorHints` **[Object][55]?** Optional hints to rendering engine.

## ColumnSpec

\[[AppSharedTypes][10]]

Column specification for table rendering.

Type: [Object][55]

### Properties

*   `path` **[string][56]?** JSON-Pointer to a value which will populate this column.
*   `header` **[string][56]** Header label to show in the table.
*   `type` **[string][56]?** Type hint: 'string'|'number'|'boolean'|'date'|'array'|'object'.
*   `numberFormat` **([NumberFormatSpec][19] | [Object][55])?** Structured number/date format metadata.
*   `cellStyle` **[Object][55]?** Partial style override to pass to StyleResolver.
*   `width` **[number][58]?** Column width in pixels.

## NumberFormatSpec

\[[AppSharedTypes][10]]

Number format specification for table cells.

Type: [Object][55]

### Properties

*   `type` **[string][56]** 'TEXT' | 'NUMBER' | 'DATE' | 'DATE\_TIME' | 'PERCENT' etc.
*   `pattern` **[string][56]?** Pattern string used to build Sheets number format.

## StyleSpec

\[[AppSharedTypes][10]]

Style specification for table cells.

Type: [Object][55]

### Properties

*   `fontFamily` **[string][56]?**&#x20;
*   `fontSize` **[number][58]?**&#x20;
*   `bold` **[boolean][61]?**&#x20;
*   `italic` **[boolean][61]?**&#x20;
*   `wrap` **[boolean][61]?**&#x20;
*   `horizontalAlign` **[string][56]?** 'LEFT'|'CENTER'|'RIGHT'
*   `verticalAlign` **[string][56]?** 'TOP'|'MIDDLE'|'BOTTOM'
*   `textColor` **[string][56]?** CSS hex color
*   `backgroundColor` **[string][56]?** CSS hex color

## MatchCandidate

\[[AppSharedTypes][10]]

Match candidate returned by MappingEngine.matchCandidates()

Type: [Object][55]

### Properties

*   `mapping` **[MappingSpec][15]** The original mapping object that matched.
*   `matchType` **[string][56]** e.g. 'exact'|'prefix'|'wildcard'|'recursive'.
*   `specificityScore` **[number][58]** Computed specificity used for ranking.
*   `captures` **[Object][55]** Data extracted from wildcard captures (if any).

## RenderResult

\[[AppSharedTypes][10]]

Render result returned by RendererController.render

Type: [Object][55]

### Properties

*   `spreadsheetId` **[string][56]** ID of the spreadsheet written to.
*   `sheetsWritten` **[number][58]** Number of individual sheets created/updated.
*   `warnings` **[Array][57]\<[Object][55]\>** Non-fatal warnings produced during render.
*   `errors` **[Array][57]\<[Object][55]\>?** Non-throwing list of fatal errors if the engine was configured to continue on errors.

## GetOrCreateSheetOptions

\[[AppSharedTypes][10]]

Options bag for getOrCreateSheet

Type: [Object][55]

### Properties

*   `clearExisting` **[boolean][61]?** If true, clear existing sheet contents.
*   `allowRename` **[boolean][61]?** If true, will attempt to rename existing conflicting sheet.

## OpenSpreadsheetOptions

\[[AppSharedTypes][10]]

Options bag for opening spreadsheets

Type: [Object][55]

### Properties

*   `createIfMissing` **[boolean][61]?** Create a new spreadsheet when idOrUrl is a blank value.
*   `title` **[string][56]?** Title to use when creating a new spreadsheet.

## AppErrorTypes

Error type definitions for application error handling.

*   [ValidationError][32] - Validation error returned by the validation engine.
*   [MappingError][34] - Mapping error returned by the mapping engine.
*   [RenderError][36] - Render error returned by the rendering engine.

## ValidationError

\[[AppErrorTypes][31]]

Validation error returned by the validation engine.

Type: [Object][55]

### Parameters

*   `message` **[string][56]** Error message.
*   `path` **[string][56]?** JSON-Pointer path to the invalid value.

## MappingError

\[[AppErrorTypes][31]]

Mapping error returned by the mapping engine.

Type: [Object][55]

### Parameters

*   `message` **[string][56]** Error message.
*   `mappingId` **[string][56]?** ID of the mapping that failed.

## RenderError

\[[AppErrorTypes][31]]

Render error returned by the rendering engine.

Type: [Object][55]

### Parameters

*   `message` **[string][56]**&#x20;
*   `dataPath` **[string][56]?**&#x20;
*   `cause` **[Error][62]?**&#x20;

## RequestParser

Parsing & request normalization utilities.
Parses raw HTTP body into [ParsedPayload][11] object.

*   [parseHttpEvent][39] - Parses an Apps Script HTTP event into a normalized payload.
*   [parseJsonSafe][41] - Safe wrapper for JSON.parse with error handling.
*   [extractSpreadsheetAndData][43] - Extracts $spreadsheet and $data from parsed JSON.

## parseHttpEvent

\[[RequestParser][38]]

Safely parse an Apps Script HTTP event into a normalized parsed payload.

Behavior:

*   Receives an standard Apps Script HTTP POST event object.
*   Extracts and validates the POST body.
*   Returns a normalized payload for further processing or throws a ValidationError.

### Parameters

*   `e` **[GoogleAppsScript.Events.HttpRequestEvent][2]** Apps Script HTTP POST event object.

*   Throws **[ValidationError][32]** If parsing or validation fails (with diagnostic info).

Returns **[ParsedPayload][11]** Normalized payload to be used in the application.

## parseJsonSafe

\[[RequestParser][38]]

Safe JSON.parse wrapper that returns helpful diagnostics

Behavior:

*   Attempts to parse the JSON string using standard JSON.parse.
*   Returns the parsed value or throws a ValidationError with details.

### Parameters

*   `raw` **[string][56]** Raw JSON string.

*   Throws **[ValidationError][32]** When JSON.parse fails. Implementations should include line/column hints where possible.

Returns **[Object][55]** Parsed JavaScript value (object/array).

## extractSpreadsheetAndData

\[[RequestParser][38]]

Behavior:

*   Extracts `$spreadsheet` metadata and `$data` entries from the given parsed JSON.
*   Apply minimal validation (ensure defaults object exists, coerce legacy shapes if required).
*   Returns the extracted metadata and data as separate objects or throws a ValidationError.

### Parameters

*   `json` **[Object][55]** Parsed JSON object.

*   Throws **[ValidationError][32]** Thrown when the body is not valid JSON or `$spreadsheet`/`$data` are missing or of an incorrect type.

Returns **\{metadata: [Object][55], data: [Object][55]\}** Metadata and data separated.

## SpreadsheetWriter

Entry point for HTTP requests (Apps Script).
Minimal HTTP glue: parse incoming event, build context and delegate to controller.

*   [doPost][46] - Entry point for HTTP POST requests.
*   [doGet][49] - Check health on HTTP GET requests.
*   [\_buildContext][52] - Internal helper to build DI-style context for controller.

Notes:

*   Web Apps require doGet(e) / doPost(e) to return either an HtmlOutput or TextOutput.
    **See:** [https://developers.google.com/apps-script/guides/web][63]

## doPost

\[[SpreadsheetWriter][45]]

Entry function called by Apps Script on HTTP POST.

Behavior:

*   Must parse the incoming event, call `RequestParser.parseHttpEvent(e)` [RequestParser][38].[parseHttpEvent][39].
*   Compose a DI (Dependency Injection) context via `_buildContext(parsedPayload)` [\_buildContext][52].
*   Call `RendererController.render(parsedPayload, context)` [RendererController][64].[render][65] to produce the final result.
*   It should return a ContentService TextOutput containing a JSON payload summarizing the result **or** an error object with HTTP error semantics.

### Parameters

*   `e` **[GoogleAppsScript.Events.HttpRequestEvent][2]** HTTP event object delivered by Apps Script **See:** [GoogleAppsScript][1] referenced types from GoogleAppsScript namespace

### Examples

```javascript
// in production you would:
// const parsed = RequestParser.parseHttpEvent(e);
// const ctx = _buildContext(parsed);
// return RenderController.render(parsed, ctx);
```

Returns **[GoogleAppsScript.Content.TextOutput][8]** HTTP response.

## doGet

\[[SpreadsheetWriter][45]]

Used for health checks by the Apps Script on HTTP GET.

Behavior:

*   Return a small health-text response.

### Parameters

*   `e` **[GoogleAppsScript.Events.HttpRequestEvent][2]** HTTP event object delivered by Apps Script **See:** [GoogleAppsScript][1] referenced types from GoogleAppsScript namespace

### Examples

```javascript
// GET /exec -\> health check
```

Returns **[GoogleAppsScript.Html.HtmlOutput][9]** HTTP response, summarizing the render result or an error message.

## \_buildContext

\[[SpreadsheetWriter][45]]

Internal helper: builds a DependencyInjection-style context for RenderController.

Behavior:

*   Receives the normalized `parsedPayload` and extracts necessary data.
*   Creates and returns a context object containing the necessary instances.

### Parameters

*   `parsedPayload` **[ParsedPayload][11]** Normalized request payload.

*   Throws **[ValidationError][32]** When required configuration is missing or invalid.

Returns **[RendererContext][13]** Fully constructed context with required managers.

[1]: #googleappsscript

[2]: #googleappsscripteventshttprequestevent

[3]: #properties

[4]: #examples

[5]: #googleappsscripteventshttprequesteventpostdata

[6]: #properties-1

[7]: #examples-1

[8]: #googleappsscriptcontenttextoutput

[9]: #googleappsscripthtmlhtmloutput

[10]: #appsharedtypes

[11]: #parsedpayload

[12]: #properties-2

[13]: #renderercontext

[14]: #properties-3

[15]: #mappingspec

[16]: #properties-4

[17]: #columnspec

[18]: #properties-5

[19]: #numberformatspec

[20]: #properties-6

[21]: #stylespec

[22]: #properties-7

[23]: #matchcandidate

[24]: #properties-8

[25]: #renderresult

[26]: #properties-9

[27]: #getorcreatesheetoptions

[28]: #properties-10

[29]: #openspreadsheetoptions

[30]: #properties-11

[31]: #apperrortypes

[32]: #validationerror

[33]: #parameters

[34]: #mappingerror

[35]: #parameters-1

[36]: #rendererror

[37]: #parameters-2

[38]: #requestparser

[39]: #parsehttpevent

[40]: #parameters-3

[41]: #parsejsonsafe

[42]: #parameters-4

[43]: #extractspreadsheetanddata

[44]: #parameters-5

[45]: #spreadsheetwriter

[46]: #dopost

[47]: #parameters-6

[48]: #examples-2

[49]: #doget

[50]: #parameters-7

[51]: #examples-3

[52]: #_buildcontext

[53]: #parameters-8

[54]: https://developers.google.com/apps-script/guides/web#request_parameters

[55]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[56]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[57]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[58]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[59]: https://developers.google.com/apps-script/reference/content/text-output

[60]: https://developers.google.com/apps-script/reference/html/html-output

[61]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[62]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error

[63]: https://developers.google.com/apps-script/guides/web

[64]: RendererController

[65]: render
