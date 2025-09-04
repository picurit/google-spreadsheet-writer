Importante: Debes hacer tu razonamiento y respuestas en inglés.
Estoy creando un script genérico que permita pintar cualquier JSON en un Google Spreadsheet usando un Google Apps Script, se requiere una manera de proporcionar metadatos sobre el JSON para poder especificar la manera de pintar estos datos en la hoja de cálculo. Lo mejor para este propósito es manejar los metadatos en una etiqueta reservada. 
Utiliza el estándar para manejo de esquemas en JSON Schema, pero sin depender de él, no usar urls externas ni referencias a esquemas dependientes.
La solución propuesta debe soportar la definición de metadatos utilizando una estructura que permita especificar cómo se debe mostrar cada "ruta" del JSON en la hoja de cálculo tanto de manera granular como global.
La definición de metadatos debe hacerse sobre la propia `$spreadsheet` y los datos sobre la propia `$data`, manteniendo separados ambos conceptos.
Asegúrate de soportar estilos de celda, formatos y dirección (vertical/horizontal). 
Debe soportar valores por defecto cuando no se proporcionan metadatos específicos.

Piensa detenidamente analizando este requerimiento para generar la mejor solución posible de acuerdo a tu amplia experiencia en el uso y creación de Google Spreadsheets.

Incialmente solo debes implementar las funciones `parseHttpEvent`, `parseJsonSafe` y `extractSpreadsheetAndData` del archivo `RequestParser.js`

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
#file:request-example.json 


---

Configura el proyecto para usar `Jest` y crear el set de pruebas unitarias para `RequestParser.js` cubriendo todos los casos posibles.
Aplica las mejores practicas de programacion, incluyendo la organizacion de los tests, el uso de mocks y spies, y la limpieza de los recursos utilizados en las pruebas.
Utiliza una carpeta `test` para organizar los archivos de prueba.

Mantener la configuracion tan simple como sea posible, pero asegurarse de que todos los casos de prueba necesarios estén cubiertos.

Tener en cuenta que se agregarán mas pruebas de otros archivos, por lo que la configuracion debe ser escalable y facil de mantener.

Debes hacer tu razonamiento, respuestas y código en inglés.

---

Analiza el codigo de `RequestParser.js` debes, refactorizar el código para que sea testeable.
Los tipos para el manejo de errores deben definirse en `AppErrorTypes.js`.
Los tipos reutilizables compartidos deben definirse en `AppSharedTypes.js`.
Aplica las mejores practicas de programacion.
Modifica el archivo `RequestParser.test.js` para reflejar los cambios realizados en `RequestParser.js`.
Debes separar las pruebas en diferentes bloques dentro de una misma carpeta `RequestParser` y crear archivos de prueba individuales para cada funcionalidad.
Elimina redundancias, pruebas que puedan ser obsoletas o innecesarias, y mejora la legibilidad de los tests.
Mantener el mismo etilo y formato de documentación.
Por ahora no debes crear test para `AppErrorTypes.js` y `AppSharedTypes.js`. Unicamente debes enfocarte en `RequestParser.js`.

Todo el codigo debe ser creado de modo que sea compatible con Google Apps Script.

Debes hacer tu razonamiento, respuestas y código en inglés.

---

Ejecutando `npm test` el coverage para #file:RequestParser.js  indica que la line 182 no se tienen en cuenta # 
Analiza profundamente y aplica las mejores practicas para corregirlo

---

npm test -- --coverage --collectCoverageFrom="src/RequestParser.js"

Ejecutando `npm test` el coverage para #file:RequestParser.js  indica que hay lineas no cubiertas "79,183-185,453,505-509,549-564" se marcan en color amarillo, ademas la columna "% Branch" muestra el valor 93.84
Debes corregir las pruebas o refactorizar el código para cubrir esos casos aplicando las mejores prácticas de programación.
Prioriza la refactorizacion y creacion de codigo testeable en lugar de agregar nuevas pruebas.
Nunca, por ningún motivo, puedes agregar `module.exports` o `exports` en los archivos de código que se encuentran en la carpeta `src`.

Debes hacer tu razonamiento, respuestas y código en inglés.

---

Ejecutando `npm test` el coverage para #file:RequestParser.js  indica que hay lineas no cubiertas "183,568" se marcan en color amarillo, ademas la columna "% Branch" muestra el valor 98.3
Debes corregir las pruebas o refactorizar el código para cubrir esos casos aplicando las mejores prácticas de programación.
Nunca, por ningún motivo, puedes agregar `module.exports` o `exports` en los archivos de código que se encuentran en la carpeta `src`.

Debes hacer tu razonamiento, respuestas y código en inglés.

---
