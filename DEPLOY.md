# Despliegue — TiddlyWikiResearch Plugin

Guía de instalación y puesta en marcha del plugin semántico sobre TiddlyWiki 5 en servidor Ubuntu.

## Requisitos

| Componente | Versión probada |
|---|---|
| Node.js | v8.10.0 (mínimo) |
| npm | v5.6.0+ |
| TiddlyWiki | 5.x (global) |

> **Nota:** Node.js v8.x funciona con las versiones de dependencias indicadas abajo.
> Con Node.js ≥ 12 se pueden usar versiones más recientes de los paquetes.

## Dependencias Node.js globales

Instalar antes de levantar TiddlyWiki:

```bash
# n3 — serialización RDF/Turtle
# Usar 1.6.3 para compatibilidad con Node.js v8
npm install -g n3@1.6.3

# node-rest-client — cliente HTTP para SPARQL Update a Fuseki
npm install -g node-rest-client
```

> **Por qué n3@1.6.3:** versiones ≥ 2.x usan `globalThis` que no existe en Node.js < 12.
> `n3@1.6.3` es la última versión 1.x compatible.

## Instalación del plugin

El plugin se copia al directorio de plugins de TiddlyWiki:

```bash
cp -r /ruta/al/repo/TiddlyWikiResearch \
  /usr/lib/node_modules/tiddlywiki/plugins/alvsan/TiddlyWikiResearch
```

## Levantar el servidor

```bash
tiddlywiki Health/Research/ \
  --server 8082 $:/core/save/all text/plain text/html "" "" 10.0.2.15
```

Acceder desde el navegador: `http://10.0.2.15:8082`

## Servicios externos requeridos

| Servicio | Puerto | Descripción |
|---|---|---|
| Apache Jena Fuseki | 3030 | Triplestore SPARQL — grafos RDF |
| MongoDB | 27017 | Base documental FHIR |

El endpoint Fuseki está configurado en `js/persistResearch.js` (variable `SPARQL_UPDATE_URL`).

## Verificación

Al iniciar sin errores, la consola debe mostrar el mensaje de TiddlyWiki sin errores de módulos. Ante errores de boot revisar:

1. `node -v` — confirmar versión de Node
2. `npm list -g --depth=0` — confirmar que `n3` y `node-rest-client` están instalados
3. Revisar que Fuseki esté activo en el puerto 3030
