# Backlog — TiddlyWikiResearch Plugin

## Bugs / Fixes

- [ ] **Typo `$:/linekedhealth/`** — Corregir a `$:/linkedhealth/` en `loadResearch.js:82` y `tiddlers/parameter_view.tid`
- [ ] **Promise mal formada** — Doble `writer.end()` anidado en `persistResearch.js:40` dentro de `tiddlerToTTL()`
- [ ] **Dependencia obsoleta** — Reemplazar `node-rest-client` por `fetch` nativo en `persistResearch.js`
- [ ] **URL hardcodeada** — Parametrizar `192.168.1.134:3010` en `tiddlers/obi/obi-form.tid`
- [ ] **Parseo incorrecto de propiedades OBI** — `jsonget` devuelve array, no string para `split` en `tiddlers/obi/macro-render-obi-class.tid`

## Mejoras Funcionales

- [ ] **Selector OBI dinámico** — Leer clases disponibles desde `$:/config/obi/class-properties` en lugar de opciones hardcodeadas en `tiddlers/obi/obi-class-selector-view2.tid`
- [ ] **Expandir catálogo OBI** — Agregar más clases OBI y sus propiedades en `tiddlers/obi/config-obi-properties.tid`
- [ ] **Pipeline persist → Fuseki** — Manejo de errores, reintentos, grafo nombrado configurable, feedback visual al usuario
- [ ] **Integrar formulario con instancias OBI** — Vincular datos del formulario iframe/form-data al tiddler de instancia correspondiente
- [ ] **Aspectos adicionales** — Definir SPARQL queries para investigación, visualización de resultados, exportación RDF
