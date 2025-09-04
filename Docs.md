Importante: Debes hacer tu razonamiento y respuestas en inglés.

En la siguiente definición se detallan los requerimientos de un proyecto para la creación de un sistema de generación de informes en Google Sheets a partir de datos en formato JSON.
Sin embargo la definición de la estructura del código contempla los retornos de las funciones y se omiten las definiciones y proposito de los parámetros en cada metodo.
Debes asegurarte de incluir descripciones claras y concisas para cada parámetro y su propósito en la documentación del código, así como los tipos de retorno de cada función, incluso si son nulos y si no se requieren, esto debe explicarse.

Piensa detenidamente analizando este requerimiento para generar la mejor solución posible de acuerdo a tu amplia experiencia en el uso y creación de Google Spreadsheets.

Sigue el ejemplo del final para crear tu respuesta.
Definir la estructura del código usando una sintaxis JSDoc detallada.
Crear la solucion con compatibilidad para Google Apps Script.
No se deben implementar las funciones, solo definir la estructura del código con sus responsabilidades, parámetros y tipos de retorno.
Asegurarse manejar correctamente los parámetros de cada función y explicar todo con alto nivel de detalle.
Si utilizas estructuras auxiliares parar encapsular los parámetros de una función, debes definirlas y documentarlas con JSDoc.

--------------------------

A generic implementation is being created that allows any JSON to be drawn to a Google Spreadsheet using a Google Apps Script. A way to provide metadata about the JSON is required to specify how to draw this data to the spreadsheet.

Think carefully about requirements to create the best possible solution based on your extensive experience using and creating Google Spreadsheets.

---

## JSON Structure

Definition of a single self-contained JSON structure used for rendering following the specified requirements:

* All rendering metadata is kept under the reserved `$spreadsheet` object.
* The actual data is kept under the reserved `$data` object.
* The metadata uses JSON-Schema-like keywords (e.g. `type`, `properties`, `items`, `default`) but does **not** reference any external schema or URL.
* Path syntax is a JSON-Pointer with two lightweight extensions: `*` (single-level wildcard for any key/index) and `**` (recursive wildcard). Example: `/array_of_objects/*/name`.
* Metadata supports global defaults and granular per-path overrides, cell styles, formats, direction (vertical/horizontal), array/table handling, transforms, and default fallbacks.
* The file is meant as a canonical metadata + data document.
* The Google Apps Script should read `$spreadsheet` to know how to render `$data`.

Below is the JSON.

```json
{
  "$spreadsheet": {
    "schemaVersion": "spreadsheet-render-1.0",
    "description": "Render instructions for converting arbitrary JSON into Google Sheets. Use JSON-Pointer with '*' and '**' wildcards in paths. More specific mappings override more general ones. If multiple mappings match a path, the mapping with higher specificity wins; if same specificity, the later mapping in the list wins.",
    "pathSyntax": {
      "type": "json-pointer-wildcard",
      "notes": [
        "Use standard JSON Pointer segments, e.g. /object/key",
        "'*' matches any single key or array index in that position, e.g. /array/*/id",
        "'**' matches any number of path segments recursively, e.g. /object/**/value"
      ],
      "examples": ["/array_of_objects/*/name", "/object_nested/**/level3"]
    },
    "builtInTransforms": {
      "parseDateISO": "Parse ISO-8601 string into spreadsheet Date",
      "preserveLeadingZeros": "Treat string as TEXT to preserve leading zeros",
      "toString": "Convert value to string",
      "parseJSON": "Parse a JSON string into an object/array and render according to mapping",
      "escapeControlChars": "Replace control chars with visible escape sequences (e.g. \\u0001 -> \\u0001)",
      "bigIntToText": "Render integers greater than `numberPrecisionThreshold` as TEXT to prevent precision loss",
      "join": "Join array primitives with provided separator",
      "boolToCheckbox": "Render boolean as checkbox (TRUE/FALSE)"
    },
    "defaults": {
      "sheet": {
        "defaultColumnWidth": 120,
        "defaultRowHeight": 21,
        "freezeHeader": true,
        "nameTemplate": "{root}", 
        "createSheetsForDeepTables": true
      },
      "cellStyle": {
        "fontFamily": "Arial",
        "fontSize": 10,
        "bold": false,
        "italic": false,
        "wrap": true,
        "horizontalAlign": "LEFT",
        "verticalAlign": "MIDDLE",
        "textColor": "#000000",
        "backgroundColor": "#FFFFFF"
      },
      "headerStyle": {
        "fontFamily": "Arial",
        "fontSize": 10,
        "bold": true,
        "wrap": true,
        "horizontalAlign": "CENTER",
        "backgroundColor": "#F2F2F2",
        "textColor": "#000000"
      },
      "numberPrecisionThreshold": 9007199254740991,
      "typeDefaults": {
        "string": {
          "numberFormat": { "type": "TEXT" },
          "cellStyle": { "wrap": true },
          "transform": null
        },
        "number": {
          "numberFormat": { "type": "NUMBER", "pattern": "#,##0.########" },
          "cellStyle": { "horizontalAlign": "RIGHT" },
          "transform": null
        },
        "boolean": {
          "renderAs": "CHECKBOX",
          "cellStyle": { "horizontalAlign": "CENTER" }
        },
        "null": {
          "display": "",
          "cellStyle": { "italic": true, "textColor": "#888888" }
        },
        "array": {
          "render": "inline-by-default",
          "direction": "vertical",
          "joiner": ", "
        },
        "object": {
          "render": "flatten",
          "flattenSeparator": ".",
          "createSubtableForArrays": true
        }
      },
      "globalHeader": {
        "show": true,
        "labelSource": "propertyName",
        "styleRef": "headerStyle"
      },
      "nullDisplay": "",
      "emptyArrayDisplay": "[empty array]",
      "emptyObjectDisplay": "{ }",
      "emptyStringDisplay": ""
    },
    "mappings": [
      {
        "id": "fallback-all",
        "path": "/**",
        "match": "recursive-wildcard",
        "description": "Catch-all fallback mapping: render everything as a single cell (type-aware). More specific mappings later in this list will override this.",
        "display": {
          "mode": "cell",
          "valueSource": "value", 
          "typeResolution": "runtime", 
          "formatting": "use typeDefaults"
        }
      },

      {
        "id": "root-as-key-value-list",
        "path": "/",
        "match": "exact",
        "description": "Render the root object as a two-column vertical list: property | rendered value. Arrays/objects are expanded according to specialized mappings.",
        "display": {
          "mode": "propertyList",
          "sheetName": "Main",
          "direction": "vertical",
          "columns": [
            {
              "col": 0,
              "header": "Property",
              "value": { "source": "propertyName", "transform": "toString" },
              "style": { "bold": true }
            },
            {
              "col": 1,
              "header": "Value",
              "value": { "source": "value", "transform": null },
              "styleRef": "cellStyle"
            }
          ],
          "afterEachProperty": {
            "insertSpacingRows": 0,
            "expandArraysInlineIfPrimitive": true
          }
        },
        "behaviorHints": {
          "expandObjectsInlineUpToDepth": 2,
          "ifArrayOfObjectsCreateSubTable": true
        }
      },

      {
        "id": "array_of_objects_table",
        "path": "/array_of_objects",
        "match": "exact",
        "description": "Render this specific array-of-objects as a table with explicit columns and types.",
        "display": {
          "mode": "table",
          "sheetName": "array_of_objects",
          "header": { "show": true, "labelSource": "propertyName", "styleRef": "headerStyle" },
          "direction": "vertical",
          "columns": [
            {
              "path": "/array_of_objects/*/id",
              "header": "id",
              "type": "number",
              "numberFormat": { "type": "NUMBER", "pattern": "0" },
              "cellStyle": { "horizontalAlign": "RIGHT" },
              "width": 60
            },
            {
              "path": "/array_of_objects/*/name",
              "header": "name",
              "type": "string",
              "cellStyle": { "wrap": true },
              "width": 220
            },
            {
              "path": "/array_of_objects/*/active",
              "header": "active",
              "type": "boolean",
              "renderAs": "CHECKBOX",
              "width": 70,
              "cellStyle": { "horizontalAlign": "CENTER" }
            },
            {
              "path": "/array_of_objects/*/score",
              "header": "score",
              "type": "number",
              "numberFormat": { "type": "NUMBER", "pattern": "#,##0.00" },
              "cellStyle": { "horizontalAlign": "RIGHT" },
              "width": 90
            }
          ],
          "rowOptions": { "striped": true },
          "tableOptions": { "freezeHeader": true }
        }
      },

      {
        "id": "array_numbers_horizontal",
        "path": "/array_numbers",
        "match": "exact",
        "description": "Render array of primitives horizontally as a single-row (one column per element).",
        "display": {
          "mode": "list",
          "sheetName": "Main",
          "direction": "horizontal",
          "valueSource": "value",
          "item": {
            "type": "number",
            "numberFormat": { "type": "NUMBER", "pattern": "0" }
          },
          "header": { "show": false },
          "joiner": null
        }
      },

      {
        "id": "array_mixed_expand",
        "path": "/array_mixed",
        "match": "exact",
        "description": "Render mixed array: primitives shown inline (comma-joined) and nested objects/arrays expanded vertically beneath the property row with indentation.",
        "display": {
          "mode": "composed",
          "sheetName": "Main",
          "direction": "vertical",
          "primitivesRender": { "as": "joined", "separator": ", " },
          "objectsRender": { "as": "subrows", "indent": 2 },
          "arraysRender": { "as": "subrows", "indent": 2 },
          "cellStyle": { "wrap": true }
        }
      },

      {
        "id": "array_with_nulls",
        "path": "/array_with_nulls",
        "match": "exact",
        "description": "Preserve nulls as empty cells while rendering other elements vertically.",
        "display": {
          "mode": "list",
          "direction": "vertical",
          "valueSource": "value",
          "preserveNulls": true,
          "emptyItemDisplay": "",
          "item": {
            "typeResolution": "runtime",
            "nullDisplay": ""
          }
        }
      },

      {
        "id": "object_nested_flatten_and_deep_table",
        "path": "/object_nested",
        "match": "prefix",
        "description": "Flatten small nested objects inline (dot-separated columns). If an inner property is an array of objects (like level3_array) create a separate sheet table for it.",
        "display": {
          "mode": "object",
          "sheetName": "Main",
          "render": "flatten",
          "flattenSeparator": ".",
          "maxInlineFlattenDepth": 2,
          "arrayOfObjectsBehavior": {
            "createSubtable": true,
            "sheetNameTemplate": "{parent}_{property}",
            "subtableHeaderStyleRef": "headerStyle"
          },
          "cellStyle": { "wrap": true }
        }
      },

      {
        "id": "level3_array_table",
        "path": "/object_nested/level1/level2/level3_array",
        "match": "exact",
        "description": "Subtable for nested array of objects coming from object_nested.level1.level2.level3_array",
        "display": {
          "mode": "table",
          "sheetName": "object_nested.level3_array",
          "header": { "show": true, "labelSource": "propertyName" },
          "direction": "vertical",
          "columns": [
            {
              "path": "/object_nested/level1/level2/level3_array/*/a",
              "header": "a",
              "type": "number",
              "numberFormat": { "type": "NUMBER", "pattern": "0" }
            },
            {
              "path": "/object_nested/level1/level2/level3_array/*/b",
              "header": "b",
              "type": "array",
              "displayHint": { "as": "joined", "separator": "; " }
            }
          ]
        }
      },

      {
        "id": "keys_examples_preserve_header_names",
        "path": "/keys_examples",
        "match": "prefix",
        "description": "Demonstrate handling of keys with spaces, leading digits and special characters. Headers will use the original key names but a safe fallback is provided.",
        "display": {
          "mode": "propertyList",
          "sheetName": "Main",
          "direction": "vertical",
          "columns": [
            { "col": 0, "header": "Property", "value": { "source": "propertyName" } },
            { "col": 1, "header": "Value", "value": { "source": "value" } }
          ],
          "headerSanitize": {
            "replaceCharacters": { " ": " ", "/": "/", "\\": "\\" },
            "fallbackPrefix": "k_"
          }
        }
      },

      {
        "id": "json_text_as_string_parse",
        "path": "/json_text_as_string",
        "match": "exact",
        "description": "Treat strings that contain JSON as parseable. Default: show parsed result as nested table (if object/array) and keep raw string in a note.",
        "display": {
          "mode": "cell+expand",
          "sheetName": "Main",
          "cell": {
            "showRaw": false,
            "transform": "parseJSON",
            "ifParsedIsObject": { "render": "propertyListInline", "flatten": true },
            "ifParsedIsArray": { "render": "tableIfArrayOfObjectsElseList" }
          },
          "noteAppendRaw": true
        }
      },

      {
        "id": "number_leading_zero_string",
        "path": "/number_leading_zero_string",
        "match": "exact",
        "description": "Preserve leading zeros by rendering as TEXT.",
        "display": {
          "mode": "cell",
          "typeHint": "string",
          "transform": "preserveLeadingZeros",
          "cellStyle": { "horizontalAlign": "LEFT" },
          "numberFormat": { "type": "TEXT" }
        }
      },

      {
        "id": "hex_literal_as_string",
        "path": "/hex_literal_as_string",
        "match": "exact",
        "description": "Render hex literals as TEXT to preserve the representation.",
        "display": {
          "mode": "cell",
          "typeHint": "string",
          "cellStyle": { "horizontalAlign": "LEFT" },
          "numberFormat": { "type": "TEXT" }
        }
      },

      {
        "id": "date_as_string_parse",
        "path": "/date_as_string",
        "match": "exact",
        "description": "Parse ISO date string into sheet Date object and format it.",
        "display": {
          "mode": "cell",
          "typeHint": "date",
          "transform": "parseDateISO",
          "numberFormat": { "type": "DATE_TIME", "pattern": "yyyy-mm-dd hh:mm:ss" },
          "cellStyle": { "horizontalAlign": "CENTER" }
        }
      },

      {
        "id": "string_control_escape",
        "path": "/string_control",
        "match": "exact",
        "description": "Show control characters as escaped sequences so they don't break sheet rendering.",
        "display": {
          "mode": "cell",
          "typeHint": "string",
          "transform": "escapeControlChars",
          "cellStyle": { "wrap": false, "backgroundColor": "#FFF7E6" },
          "numberFormat": { "type": "TEXT" }
        }
      },

      {
        "id": "string_escapes_unicode",
        "path": "/string_escapes",
        "match": "exact",
        "description": "Preserve newlines & tabs; enable wrap so multiline appears correctly in a cell.",
        "display": {
          "mode": "cell",
          "typeHint": "string",
          "cellStyle": { "wrap": true, "verticalAlign": "TOP" },
          "numberFormat": { "type": "TEXT" }
        }
      },

      {
        "id": "string_unicode",
        "path": "/string_unicode",
        "match": "exact",
        "description": "Unicode strings are supported; preserve glyphs.",
        "display": {
          "mode": "cell",
          "typeHint": "string",
          "cellStyle": { "wrap": true },
          "numberFormat": { "type": "TEXT" }
        }
      },

      {
        "id": "number_big_as_text",
        "path": "/number_big",
        "match": "exact",
        "description": "Numbers above threshold are rendered as TEXT to avoid browser JS precision errors.",
        "display": {
          "mode": "cell",
          "typeHint": "string",
          "transform": "bigIntToText",
          "cellStyle": { "horizontalAlign": "LEFT" },
          "numberFormat": { "type": "TEXT" }
        }
      },

      {
        "id": "empty_values",
        "path": "/empty_values",
        "match": "prefix",
        "description": "Render empty containers and empty strings with explicit placeholders defined in defaults.",
        "display": {
          "mode": "object",
          "render": "flatten",
          "emptyArrayDisplay": "[empty array]",
          "emptyObjectDisplay": "{ }",
          "emptyStringDisplay": "",
          "cellStyle": { "italic": true, "textColor": "#888888" }
        }
      },

      {
        "id": "nested_combination_complex",
        "path": "/nested_combination",
        "match": "exact",
        "description": "Arbitrary nested arrays/objects: default to optical representation — show top-level as list, and expand nested arrays/objects in subrows/subtables.",
        "display": {
          "mode": "complex",
          "sheetName": "Main",
          "direction": "vertical",
          "primitives": { "render": "joined", "separator": ", " },
          "objects": { "render": "subrows", "indent": 2 },
          "arrays": { "render": "subrowsOrSheets", "createSheetIfLarge": true },
          "cellStyle": { "wrap": true }
        }
      },

      {
        "id": "array_empty_and_object_empty_rendering",
        "path": "/array_empty",
        "match": "exact",
        "display": { "mode": "cell", "valueSource": "value", "renderEmptyAs": "[empty array]" }
      },

      {
        "id": "object_empty",
        "path": "/object_empty",
        "match": "exact",
        "display": { "mode": "cell", "valueSource": "value", "renderEmptyAs": "{ }" }
      },

      {
        "id": "string_empty",
        "path": "/string_empty",
        "match": "exact",
        "display": { "mode": "cell", "valueSource": "value", "renderEmptyAs": "" }
      },

      {
        "id": "boolean_defaults",
        "path": "/**/boolean",
        "match": "type-pattern",
        "description": "Type-based override for booleans anywhere: show as checkbox if supported else 'TRUE/FALSE'.",
        "display": {
          "mode": "cell",
          "typeHint": "boolean",
          "renderAs": "CHECKBOX",
          "cellStyle": { "horizontalAlign": "CENTER" }
        }
      },

      {
        "id": "number_defaults",
        "path": "/**/number",
        "match": "type-pattern",
        "description": "Type-based override for numbers anywhere.",
        "display": {
          "mode": "cell",
          "typeHint": "number",
          "numberFormat": { "type": "NUMBER", "pattern": "#,##0.########" },
          "cellStyle": { "horizontalAlign": "RIGHT" }
        }
      },

      {
        "id": "string_defaults",
        "path": "/**/string",
        "match": "type-pattern",
        "description": "Type-based override for strings anywhere; default to TEXT with wrapping.",
        "display": {
          "mode": "cell",
          "typeHint": "string",
          "numberFormat": { "type": "TEXT" },
          "cellStyle": { "wrap": true }
        }
      }

    ]
  },

  "$data": {
    "string_simple": "Hello, world",
    "string_empty": "",
    "string_escapes": "LLine1\nTab\tQuotes \" \\ / \b \f \r",
    "string_unicode": "ñ, 漢字, Привет, 😄",
    "string_control": "\u0001",

    "number_integer": 42,
    "number_zero": 0,
    "number_negative": -123,
    "number_fraction": 3.14159,
    "number_exponent": 1.23e+10,
    "number_negative_exponent": -2.5E-3,
    "number_big": 9007199254740991,

    "boolean_true": true,
    "boolean_false": false,
    "null_value": null,

    "array_empty": [],
    "array_numbers": [1, 2, 3],
    "array_mixed": ["text", 10, true, null, {"k": 1}, [1, 2, 3]],
    "array_with_nulls": [null, 1, null],

    "object_empty": {},
    "object_nested": {
      "level1": {
        "level2": {
          "level3": "deep value",
          "level3_array": [{"a": 1}, {"b": [true, false, null]}]
        }
      }
    },

    "keys_examples": {
      "simple": 1,
      "with space": "space",
      "123start": "text_as_key",
      "unicode_ñ": "value",
      "special-chars_!@#": "ok"
    },

    "json_text_as_string": "{\"a\":1,\"b\":[2,3]}",
    "number_leading_zero_string": "00123",
    "hex_literal_as_string": "0xFF",
    "date_as_string": "2025-08-29T18:00:00Z",

    "empty_values": {"empty_array": [], "empty_object": {}, "empty_string": ""},

    "nested_combination": [
      {"k": [{"deep": null}, []]},
      []
    ],

    "array_of_objects": [
      {
        "id": 1,
        "name": "Object A",
        "active": true,
        "score": 9.5
      },
      {
        "id": 2,
        "name": "Object B",
        "active": false,
        "score": 7.3
      },
      {
        "id": 3,
        "name": "Object C",
        "active": true,
        "score": 8.0
      }
    ]
  }
}
```

---

# Code Structure

The code is organized into several key modules, each with a specific responsibility:

1. **SpreadsheetWriter.gs**: Entry point for handling HTTP requests and responses.
2. **RequestParser.gs**: Responsible for parsing incoming requests and normalizing the payload.
3. **MetadataValidator.gs**: Validates the structure and content of the metadata.
4. **RendererController.gs**: Orchestrates the rendering process based on the parsed request and validated metadata.

Each module is designed to be independent and reusable, following best practices for code organization and separation of concerns.

---

# Script files & responsibilities (entry: `SpreadsheetWriter.gs`)

Below I list the recommended Google Apps Script files. For each file there are a short responsibility statement and the names/signatures of the internal methods (parameters + purpose). No implementation — just a clean, SOLID, dependency-injection-friendly API surface that can be implemented.

---

## `SpreadsheetWriter.gs` — **Entry point / HTTP glue**

Responsibility: single HTTP entry point for the whole system. Minimal logic: parse the incoming event, build a request object, delegate to the orchestration/controller layer, return an HTTP response.

Methods:

* `doPost(e)`

  * **Parameters:** `e` (Google Apps Script HTTP event object)
  * **Purpose:** Entry function called by Apps Script on HTTP POST. Parse `e.postData.contents`, call `RequestParser.parseHttpEvent(e)`, then `RendererController.render(parsed)`. Build and return a `ContentService` response indicating success or structured error.

* `doGet(e)` *(optional helper)*

  * **Parameters:** `e` (event)
  * **Purpose:** Minimal GET endpoint used for health-checks or quick manual invocation. Delegates to `RendererController.render` when provided with test payload query param.

* `_buildContext(parsedPayload)` *(internal)*

  * **Parameters:** `parsedPayload` (`{ metadata, data, raw }`)
  * **Purpose:** Compose DI container/context (instances of SheetManager, TransformRegistry, AppLogger, etc.) to pass into `RendererController`. Keeps `doPost` small and testable.

---

## `RequestParser.gs` — **Parsing & request normalization**

Responsibility: safely parse raw HTTP body, detect JSON, separate `$spreadsheet` metadata and `$data`, return a normalized payload object. Fail-fast on invalid JSON.

Methods:

* `parseHttpEvent(e)`

  * **Parameters:** `e` (apps-script event)
  * **Returns:** `{ metadata: Object, data: Object, raw: string }`
  * **Purpose:** Parse `e.postData.contents`, handle `application/json`, decode, return normalized shape with `$spreadsheet` under `metadata` and `$data` under `data`. If not JSON, throw `ValidationError`.

* `parseJsonSafe(raw)`

  * **Parameters:** `raw` (string)
  * **Returns:** `Object`
  * **Purpose:** JSON.parse wrapper that catches exceptions and returns a diagnostic error with line/column when possible.

* `extractSpreadsheetAndData(json)`

  * **Parameters:** `json` (Object)
  * **Returns:** `{ metadata: Object, data: Object }`
  * **Purpose:** Ensure `$spreadsheet` and `$data` are present and return them; apply minimal normalization (e.g., ensure `$spreadsheet.defaults` exists).

---

## `MetadataValidator.gs` — **Validation of metadata & basic schema rules**

Responsibility: validate the `$spreadsheet` metadata structure (local rules only — no external schemas). Provide clear, typed errors for the rendering engine.

Methods:

* `validateEnvelope(payload)`

  * **Parameters:** `payload` (`{ metadata, data }`)
  * **Returns:** `void` (throws `ValidationError` on failure)
  * **Purpose:** Top-level validation: `$spreadsheet` and `$data` existence, types, and top-level fields permitted.

* `validateMappings(metadata)`

  * **Parameters:** `metadata` (Object)
  * **Returns:** `void`
  * **Purpose:** Validate each mapping's path syntax, required fields, header/column shapes, and that wildcard/recursive patterns are syntactically valid.

* `validateMappingRule(mapping)`

  * **Parameters:** `mapping` (Object)
  * **Purpose:** Validate a single mapping object (called by `validateMappings`).

* `validationError(message, context)`

  * **Parameters:** `message` (string), `context` (optional object)
  * **Purpose:** Helper to generate a consistent `ValidationError` with contextual info.

---

## `MappingEngine.gs` — **Select & merge applicable mapping for any JSON path**

Responsibility: given a data-path, find all matching mapping rules (wildcards, recursive, prefix, exact), compute specificity, merge global/defaults with per-path overrides and return the final mapping to use.

Methods:

* `resolveMappingForPath(dataPath, metadata)`

  * **Parameters:** `dataPath` (string JSON-Pointer), `metadata` (object `$spreadsheet`)
  * **Returns:** `mapping` (object)
  * **Purpose:** Return the fully merged mapping for `dataPath`. Uses `matchCandidates`, `rankBySpecificity`, and `mergeMappings`.

* `matchCandidates(dataPath, mappings)`

  * **Parameters:** `dataPath` (string), `mappings` (array)
  * **Returns:** `Array<{mapping, matchInfo}>`
  * **Purpose:** Return mappings that match `dataPath` with match metadata (type of match, captured segments).

* `rankBySpecificity(matches)`

  * **Parameters:** `matches` (Array)
  * **Returns:** Sorted matches by specificity (exact > prefix > wildcard single-level > recursive) and by mapping order when equal.

* `mergeMappings(baseMapping, overrideMapping)`

  * **Parameters:** `baseMapping`, `overrideMapping`
  * **Returns:** `mergedMapping`
  * **Purpose:** Deterministic deep-merge following metadata rules (later overrides earlier; arrays are replaced unless flagged to concat).

* `computeSpecificityScore(mappingPath)`

  * **Parameters:** `mappingPath` (string)
  * **Returns:** `number`
  * **Purpose:** Heuristic used to compare mapping specificity.

---

## `PathResolver.gs` — **JSON path utilities and traversal**

Responsibility: operations over JSON Pointers, expand wildcard patterns into concrete data paths for given `$data`, iterate nodes in canonical order.

Methods:

* `normalizePointer(pointer)`

  * **Parameters:** `pointer` (string)
  * **Returns:** normalized pointer string
  * **Purpose:** Convert user-supplied pointers into canonical form (leading slash, no trailing slash etc.).

* `expandWildcardsOnData(rootData, pattern)`

  * **Parameters:** `rootData` (object), `pattern` (string)
  * **Returns:** `Array<string>` (concrete dataPaths that match)
  * **Purpose:** Given a wildcard mapping path (with `*` or `**`), return each concrete path present in `rootData`.

* `iterateDataPaths(rootData, callback)`

  * **Parameters:** `rootData`, `callback(path, value)`
  * **Purpose:** Depth-first iteration over all data paths (yields pointer and value). The callback can stop or skip subtrees.

* `getValueByPointer(rootData, pointer)`

  * **Parameters:** `rootData`, `pointer`
  * **Returns:** `value`
  * **Purpose:** Retrieve a value supporting safe access for unusual keys (spaces, punctuation, numeric-starting keys).

---

## `TransformRegistry.gs` — **Registry & invoker for transforms**

Responsibility: central registry for data transforms. Transforms are first-class, can be registered at startup or by plugins; the registry executes them with context.

Methods:

* `registerTransform(name, fn)`

  * **Parameters:** `name` (string), `fn` (function `(value, context) => transformedValue`)
  * **Purpose:** Add/override a transform implementation.

* `applyTransforms(transformSpec, value, context)`

  * **Parameters:** `transformSpec` (string or array), `value`, `context` (object)
  * **Returns:** transformed value
  * **Purpose:** Apply one or more transforms in order. Support shorthand `transform: "parseDateISO"` or `["parseJSON","escapeControlChars"]`.

* `hasTransform(name)`

  * **Parameters:** `name`
  * **Returns:** boolean
  * **Purpose:** Query whether a named transform exists.

---

## `BuiltInTransforms.gs` — **Implementations of built-in transforms**

Responsibility: concrete implementations for the standard transforms referenced in metadata (keeps implementations separated from registry for SRP).

Methods (each exported function):

* `parseDateISO(value, context)` — parse ISO-8601 -> Apps Script Date or throw if invalid.
* `preserveLeadingZeros(value, context)` — force as string and tag to render as TEXT.
* `bigIntToText(value, context)` — convert large integers to string to avoid JS precision issues.
* `parseJSON(value, context)` — safely parse JSON-encoded strings and return object/array.
* `escapeControlChars(value, context)` — convert control characters to visible escapes for notes/cells.
* `join(value, context)` — join primitive arrays with `context.separator` or mapping-specified separator.
* `boolToCheckbox(value, context)` — normalize boolean to true/false for checkbox rendering.

---

## `SheetManager.gs` — **Spreadsheet & sheet life-cycle management**

Responsibility: open/create spreadsheet, create or find sheets, apply naming rules, ensure layout defaults (widths, freeze panes). Keep all direct calls to `SpreadsheetApp` here.

Methods:

* `openSpreadsheetByIdOrUrl(idOrUrl, createIfMissing = false)`

  * **Parameters:** `idOrUrl` (string), `createIfMissing` (boolean)
  * **Returns:** `Spreadsheet` (Apps Script object)
  * **Purpose:** Open an existing spreadsheet or create a new one.

* `getOrCreateSheet(spreadsheet, sheetName, options = {})`

  * **Parameters:** `spreadsheet`, `sheetName`, `options` (`{ clearExisting:boolean }`)
  * **Returns:** `Sheet`
  * **Purpose:** Find or create a sheet with safe name; optionally clear content if required.

* `safeSheetName(name)`

  * **Parameters:** `name` (string)
  * **Returns:** sanitized sheet name string ( <= 100 chars, no illegal chars )
  * **Purpose:** Ensure compatibility with Google Sheets naming constraints.

* `applySheetDefaults(sheet, defaults)`

  * **Parameters:** `sheet`, `defaults` (object)
  * **Purpose:** Set column widths, row heights, gridlines, freeze header, etc.

* `deleteOrArchiveSheet(spreadsheet, sheetName, options)`

  * **Parameters:** `spreadsheet`, `sheetName`, `options`
  * **Purpose:** Clean-up strategy (either delete or move to "\_archive" per options).

---

## `StyleResolver.gs` — **Convert metadata style spec into Sheets operations**

Responsibility: translate metadata `cellStyle`, `headerStyle` into actionable Google Sheets operations (alignment, font, color). Returns a canonical style object consumable by `CellWriter`.

Methods:

* `computeCellStyle(mappingStyle, defaults)`

  * **Parameters:** `mappingStyle` (object), `defaults` (object)
  * **Returns:** canonical `styleSpec` (flat object with all fields resolved)
  * **Purpose:** Merge style defaults with mapping-specified fields; normalize color formats and enumerate booleans.

* `applyStyleToRange(range, styleSpec)`

  * **Parameters:** `range` (Apps Script Range), `styleSpec` (object)
  * **Purpose:** Apply style (setFontFamily, setFontSize, setBackground, setWrap, setHorizontalAlignment, setFontWeight etc.) within the engine.

---

## `Formatter.gs` — **Number and date format handling**

Responsibility: translate metadata `numberFormat` objects into Google Sheets `Range.setNumberFormat` strings and apply them.

Methods:

* `buildNumberFormatSpec(numberFormatMetadata)`

  * **Parameters:** `numberFormatMetadata` (object)
  * **Returns:** string (Google Sheets number format pattern)
  * **Purpose:** Map structured format spec to Sheets pattern (e.g., `#,#00.00`, date/time patterns).

* `applyNumberFormat(range, formatSpec)`

  * **Parameters:** `range`, `formatSpec` (string)
  * **Purpose:** Range.setNumberFormat(formatSpec) with safe guards.

---

## `RendererController.gs` — **High-level rendering orchestration**

Responsibility: high-level orchestrator that walks `$data`, resolves mappings via `MappingEngine`, and delegates node rendering to specialized renderers (table/list/object/cell). Coordinates sheet creation via `SheetManager`.

Methods:

* `render(payload, context)`

  * **Parameters:** `payload` (`{metadata, data}`), `context` (DI container)
  * **Returns:** `renderResult` (`{ spreadsheetId, sheetsWritten, warnings }`)
  * **Purpose:** Main entry for rendering: iterate root paths, call `renderNode` per path, collect results and warnings.

* `renderNode(dataPath, value, context)`

  * **Parameters:** `dataPath` (string), `value` (any), `context`
  * **Purpose:** Resolve mapping for the path and delegate to `CellRenderer` / `TableRenderer` / `ListRenderer` / `ObjectRenderer`.

* `createRendererForMode(mode, deps)`

  * **Parameters:** `mode` (string), `deps` (object)
  * **Returns:** renderer instance implementing `render(...)`
  * **Purpose:** Factory to create concrete renderer following the Strategy pattern. Keeps `RendererController` open for new render modes.

---

## `TableRenderer.gs` — **Render arrays-of-objects as tables**

Responsibility: writing header row, types, rows, column widths, frozen header, and optional row striping.

Methods:

* `renderTable(sheet, arrayOfObjects, columnsSpec, options)`

  * **Parameters:** `sheet` (Sheet), `arrayOfObjects` (Array<Object>), `columnsSpec` (Array), `options` (object)
  * **Returns:** `{ startRow, endRow }`
  * **Purpose:** Create header (if requested), iterate rows, write values via `CellWriter`, apply formats & styles.

* `_writeHeaderRow(sheet, columnsSpec, rowIndex)` *(internal)*

  * **Parameters:** `sheet`, `columnsSpec`, `rowIndex`
  * **Purpose:** Write headers and apply headerStyle via `StyleResolver`.

* `_writeRow(sheet, rowIndex, object, columnsSpec)` *(internal)*

  * **Parameters:** `sheet`, `rowIndex`, `object`, `columnsSpec`
  * **Purpose:** Map `object` properties to columns; uses `CellWriter.writeCell` for each cell.

---

## `PropertyListRenderer.gs` — **Render objects as property | value lists**

Responsibility: vertical lists where each row is a property name and its rendered value. Handles inline flattening up to a depth and expansion rules.

Methods:

* `renderPropertyList(sheet, obj, columnsSpec, options)`

  * **Parameters:** `sheet`, `obj` (object), `columnsSpec`, `options`
  * **Purpose:** Iterates object keys in deterministic order, writes two-column rows (property + rendered value). Handles indentation, inline flattening, and array expansion.

* `_renderValueCell(sheet, row, col, value, mapping, context)`

  * **Parameters:** sheet, row, col, value, mapping, context
  * **Purpose:** Write value cell using `CellWriter` and apply any transforms/notes.

---

## `ListRenderer.gs` — **Render primitive or mixed arrays (horizontal/vertical)**

Responsibility: render arrays in multiple modes (horizontal, vertical, joined in cell, composed expansion). Preserve nulls and special empty-item behavior.

Methods:

* `renderList(sheet, array, spec, start)`

  * **Parameters:** `sheet`, `array` (Array), `spec` (direction, item spec), `start` (`{row, col}`)
  * **Returns:** `{endRow, endCol}`
  * **Purpose:** Render primitive items or delegate nested items to `ObjectRenderer`/`TableRenderer` as needed.

* `_renderPrimitiveItem(sheet, row, col, value, itemSpec)`

  * **Parameters:** as named
  * **Purpose:** Render individual primitive item using `CellWriter` with number/string/boolean rules.

---

## `ObjectRenderer.gs` — **Flatten or expand objects**

Responsibility: render an object inline as flattened columns, or expand into a subtable/list according to mapping `render` rules.

Methods:

* `renderFlattenedObject(sheet, obj, baseCol, mapping, options)`

  * **Parameters:** `sheet`, `obj`, `baseCol` (int), `mapping`, `options`
  * **Purpose:** Flatten keys into adjacent columns using `flattenSeparator` and write a single row or header+row block.

* `renderObjectAsSubrows(sheet, obj, startRow, mapping, options)`

  * **Parameters:** `sheet`, `obj`, `startRow`, `mapping`, `options`
  * **Purpose:** Render each child key/value as separate rows indented (useful for nested structures).

---

## `CellWriter.gs` — **Low-level writes to cells/ranges**

Responsibility: single-responsibility writer that writes values/notes/checkboxes and timestamps; does not decide mapping — only applies it safely to ranges.

Methods:

* `writeCell(sheet, row, col, value, typeHint, options)`

  * **Parameters:** `sheet`, `row` (int), `col` (int), `value`, `typeHint` (`"string"|"number"|"boolean"|"date"|"formula"`), `options` (object)
  * **Purpose:** Write the value to the cell using correct Apps Script API calls (setValue, setNumberFormat, setFormula, setNote). Uses `Formatter` & `StyleResolver` where needed.

* `setCheckbox(sheet, row, col, checked)`

  * **Parameters:** `sheet`, `row`, `col`, `checked` (boolean)
  * **Purpose:** Configure cell as checkbox and set state.

* `writeNote(sheet, row, col, note)`

  * **Parameters:** `sheet`, `row`, `col`, `note` (string)
  * **Purpose:** Attach note (e.g., raw JSON preserved) without modifying cell text.

* `writeRangeValues(sheet, startRow, startCol, values2D)`

  * **Parameters:** `sheet`, `startRow`, `startCol`, `values2D` (array of arrays)
  * **Purpose:** Bulk write to minimize API calls.

---

## `AppLogger.gs` — **Structured logging & diagnostics**

Responsibility: provide a small logging abstraction you can later point to Stackdriver or console; supports levels, correlation ids, and optional telemetry.

Methods:

* `debug(message, meta)`

  * **Parameters:** `message`, `meta` (object)
  * **Purpose:** Low-level logs.

* `info(message, meta)`

  * **Purpose:** Operational logs.

* `warn(message, meta)`

  * **Purpose:** Non-fatal warnings.

* `error(message, meta)`

  * **Purpose:** Errors, includes stack trace and context.

* `wrap(name, fn)`

  * **Parameters:** `name` (string), `fn` (function)
  * **Returns:** function that logs entry/exit and captures exceptions.

---

## `ErrorsAndTypes.gs` — **Typed errors and shared domain types**

Responsibility: centralized custom error types and a few shared domain enums so other modules can throw/handle typed exceptions.

Types / functions:

* `ValidationError(message, path)` — typed Error with `path` property.
* `MappingError(message, mappingId)` — thrown when mapping resolution fails.
* `RenderError(message, dataPath, cause)` — thrown when renderer fails to write.
* `isAppError(obj)` — helper to detect these error types.

---

## `Utils.gs` — **General-purpose pure helpers**

Responsibility: lightweight pure helpers used widely (deepClone, deepMerge, isPrimitive, safeTruncate, stableSort). Keep these side-effect free.

Methods:

* `deepClone(obj)`

  * **Purpose:** Immutable clone.

* `deepMerge(target, source, options)`

  * **Purpose:** Deterministic deep merge used by `MappingEngine`.

* `typeOf(value)`

  * **Purpose:** More precise type detection than `typeof` (distinguishes array, null, date).

* `isPrimitive(value)`

  * **Purpose:** True for string/number/boolean/null.

* `safeSheetName(name)` *(fallback)*

  * **Purpose:** Duplicate of `SheetManager.safeSheetName` but pure (string only).

* `truncateForCell(value, maxLen = 50000)`

  * **Purpose:** Avoid exceeding Sheets cell limits when writing long notes or strings.

---

## `Config.gs` — **System-wide constants & defaults**

Responsibility: central constants (default style, thresholds, max rows/cols, version). Avoid hard-coded literals scattered across files.

Exports:

* `DEFAULTS` (object) — default cell styles, numberFormat default pattern, `numberPrecisionThreshold`, etc.
* `SYSTEM_VERSION` (string) — e.g., `"1.0.0"`.
* `SHEET_NAME_MAX_LEN` (number).

---

# How SOLID & best practices are applied (brief)

* **Single Responsibility (S):** each `.gs` file has one clear concern (parsing, validation, mapping, rendering, sheet management, transforms, styling).
* **Open/Closed (O):** `TransformRegistry` and renderer factory allow adding new transforms and rendering modes without changing existing code. `MappingEngine` merges new mappings rather than patching logic.
* **Liskov (L):** renderers created by `createRendererForMode` all implement the same `render(...)` contract so they can be substituted.
* **Interface Segregation (I):** small focused interfaces — `CellWriter` does only writes, `StyleResolver` only computes/applies style — clients depend only on what they use.
* **Dependency Inversion (D):** high-level `RendererController` depends on abstractions (registry, sheet manager, AppLogger) passed in a context object — easy to mock for tests.

---

# Examples
Some definitions have already been implemented, use them as examples to create the rest of the necessary definitions.
These three files contain the core logic for the application:

DomainTypes.js
RequestParser.js
SpreadsheetWriter.js

Create each one of the left definitions in the corresponding files.
Your task will not be considered complete until all definitions are implemented.
