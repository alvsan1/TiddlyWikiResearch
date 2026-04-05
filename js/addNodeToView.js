/*\
title: $:/plugins/alvsan/semantic/addNodeToView.js
type: application/javascript
module-type: macro
Macro to output a single tiddler to JSON
\*/


(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Information about this macro
*/

exports.name = "addNodeToView";

exports.params = [
	{name: "nodeName"},
	{name:"main"},
	{name: "nodeGraph"},
	{name: "view"},
    {tags: "tags"}
];

/*
Run the macro
*/
exports.run = function(nodeName, main, nodeGraph, view) {
	console.log("[addNodeToView] nodeName=" + nodeName + " nodeGraph=" + nodeGraph + " view=" + view + " $tm=" + (typeof $tm));
	if (!nodeName) {
        console.warn("[addNodeToView] nodeName vacío, abortando");
        return "";
    }
    if (!view) {
        console.warn("[addNodeToView] view vacío — el tiddler de investigación no tiene el campo 'titleresearch'. Agrega ese campo manualmente o usa el título del tiddler como nombre de vista en TiddlyMap.");
        return "";
    }
    if (typeof $tm === "undefined") {
        console.warn("[addNodeToView] $tm no disponible — TiddlyMap no está cargado o aún no inicializó.");
        return "";
    }
	// Paso 1: Asegurarse de que el nodo existe
    var nodeId;
    try {
        nodeId = $tm.adapter.getId(nodeName);
    } catch(e) {
        console.error("[addNodeToView] Error en $tm.adapter.getId:", e);
        return "";
    }
    
    if (typeof nodeId === "undefined") {
        // Crear el tiddler primero
        var templateTiddler = $tw.wiki.getTiddler("$:/linkedhealth/concept_view/" + nodeGraph);
        var templateText = templateTiddler ? templateTiddler.fields.text : "";
        $tw.wiki.addTiddler(new $tw.Tiddler({
            title: nodeName,
            know: true,
            node: true,
            tags: ["concept-pending-class"],
            main : main,
            nodeGraph : nodeGraph,
            text: templateText
        }));
        
        // Forzar asignación de ID
        $tm.adapter.assignId(nodeName);
        nodeId = $tm.adapter.getId(nodeName);
        
        console.log("Nuevo nodo creado con ID: " + nodeId);
    } else {
        console.log("Nodo existente encontrado con ID: " + nodeId);
    }
    
    // Paso 2: Añadir a la vista
    if (nodeId) {
        try {
            var viewObj = new $tm.ViewAbstraction(view, {isCreate: true});
            viewObj.addNode(nodeId);
            viewObj.saveNodePosition(nodeId, { x: 0, y: 0 });
            console.log("[addNodeToView] Nodo añadido a la vista: " + view);
        } catch(e) {
            console.error("[addNodeToView] Error añadiendo a vista TiddlyMap:", e);
        }
    }

	/*
	viewSubject.addPlaceholder( nodeObject );
	viewSubject.saveNodePosition( nodeObject );*/


	$tw.wiki.deleteTiddler("$:/state/newNodeTemp");
	//$tw.syncer.syncToServer();

	return "";


}

})();