Importante: Debes hacer tu razonamiento y respuestas en inglés.
Estoy creando un script genérico que permita pintar cualquier JSON en un Google Spreadsheet usando un Google Apps Script, se requiere una manera de proporcionar metadatos sobre el JSON para poder especificar la manera de pintar estos datos en la hoja de cálculo. Lo mejor para este propósito es manejar los metadatos en una etiqueta reservada. 
Utiliza el estándar para manejo de esquemas en JSON Schema, pero sin depender de él, no usar urls externas ni referencias a esquemas dependientes.
La solución propuesta debe soportar la definición de metadatos utilizando una estructura que permita especificar cómo se debe mostrar cada "ruta" del JSON en la hoja de cálculo tanto de manera granular como global.
La definición de metadatos debe hacerse sobre la propia `$spreadsheet` y los datos sobre la propia `$data`, manteniendo separados ambos conceptos.
Asegúrate de soportar estilos de celda, formatos y dirección (vertical/horizontal). 
Debe soportar valores por defecto cuando no se proporcionan metadatos específicos.

Piensa detenidamente analizando este requerimiento para generar la mejor solución posible de acuerdo a tu amplia experiencia en el uso y creación de Google Spreadsheets.

El siguiente es en ejemplo JSON dummy con todos los casos que van a mostrarse. 
Por ahora céntrate únicamente en los JSON, no debes crear código únicamente definir el JSON. En tu solución, este JSON debe agregarse en la propiedad `$data`.

```json
{
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
```