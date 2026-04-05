/*\
title: $:/plugins/alvsan/semantic/addNodeToView.js
type: application/javascript
module-type: startup
Escucha cambios en $:/state/addNodeTrigger y agrega el nodo a la vista TiddlyMap indicada.
\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.platforms = ["browser"];

exports.startup = function() {
    $tw.wiki.addEventListener("change", function(changes) {
        if (!changes["$:/state/addNodeTrigger"]) return;

        var trigger = $tw.wiki.getTiddler("$:/state/addNodeTrigger");
        if (!trigger) return;

        var nodeName  = trigger.fields.nodename  || "";
        var nodeGraph = trigger.fields.nodegraph || "";
        var view      = trigger.fields.view      || "";
        var main      = trigger.fields.main      || "";

        console.log("[addNodeToView] trigger recibido: nodeName=" + nodeName + " nodeGraph=" + nodeGraph + " view=" + view);

        // Limpiar el trigger primero para evitar re-ejecución
        $tw.wiki.deleteTiddler("$:/state/addNodeTrigger");

        if (!nodeName) {
            console.warn("[addNodeToView] nodeName vacío, abortando");
            return;
        }
        if (!view) {
            console.warn("[addNodeToView] view vacío, abortando");
            return;
        }
        if (typeof $tm === "undefined") {
            console.warn("[addNodeToView] $tm no disponible — TiddlyMap no está cargado");
            return;
        }

        // Paso 1: Asegurar que el tiddler del nodo existe
        var nodeId;
        try {
            nodeId = $tm.adapter.getId(nodeName);
        } catch(e) {
            console.error("[addNodeToView] Error en getId:", e);
            return;
        }

        if (typeof nodeId === "undefined") {
            var templateTiddler = $tw.wiki.getTiddler("$:/linkedhealth/concept_view/" + nodeGraph);
            var templateText = templateTiddler ? templateTiddler.fields.text : "";
            $tw.wiki.addTiddler(new $tw.Tiddler({
                title: nodeName,
                tags: ["concept-pending-class"],
                main: main,
                nodeGraph: nodeGraph,
                text: templateText
            }));
            try {
                $tm.adapter.assignId(nodeName);
                nodeId = $tm.adapter.getId(nodeName);
            } catch(e) {
                console.error("[addNodeToView] Error en assignId:", e);
                return;
            }
            console.log("[addNodeToView] Nodo creado con ID: " + nodeId);
        } else {
            console.log("[addNodeToView] Nodo existente con ID: " + nodeId);
        }

        // Paso 2: Agregar a la vista TiddlyMap
        if (nodeId) {
            try {
                var viewObj = new $tm.ViewAbstraction(view, {isCreate: true});
                viewObj.addNode(nodeId);
                viewObj.saveNodePosition(nodeId, {x: 0, y: 0});
                console.log("[addNodeToView] Nodo agregado a vista: " + view);
            } catch(e) {
                console.error("[addNodeToView] Error agregando a vista:", e);
            }
        }

        // Limpiar el campo del nodo en el formulario
        $tw.wiki.deleteTiddler("$:/state/newNodeTemp");
    });
};

})();
