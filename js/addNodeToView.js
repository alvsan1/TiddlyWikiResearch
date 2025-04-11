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
	console.log("nodeName: " + nodeName + ", main: " + main + ", nodeGraph: " + nodeGraph + ", view: " + view );
	// Paso 1: Asegurarse de que el nodo existe
    var nodeId = $tm.adapter.getId(nodeName);
    
    if (typeof nodeId === "undefined") {
        // Crear el tiddler primero
        $tw.wiki.addTiddler(new $tw.Tiddler({
            title: nodeName, 
            know: true,
            node: true,
            tags: ["concept-pending-class"],
            main : main,
            nodeGraph : nodeGraph,
            text: $tw.wiki.getTiddler("$:/linkedhealth/concept_view/" + nodeGraph).fields.text
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
        var viewObj = new $tm.ViewAbstraction(view, {isCreate: true});
        viewObj.addNode(nodeId);
        
        // Usar el método específico de ViewAbstraction para posicionar el nodo
        viewObj.saveNodePosition(nodeId, { x: 0, y: 0 });
        
        console.log("Nodo añadido a la vista: " + view);
    }

	/*
	viewSubject.addPlaceholder( nodeObject );
	viewSubject.saveNodePosition( nodeObject );*/


	$tw.wiki.deleteTiddler("$:/state/newNodeTemp");
	//$tw.syncer.syncToServer();

	return "";


}

})();