/*\
title: $:/plugins/alvsan/semantic/research.js
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

exports.name = "research";

exports.params = [
	{name: "titleResearch"},
	{name: "view"}
];

/*
Run the macro
*/
exports.run = function(titleResearch, view) {


	var myView = new $tm.ViewAbstraction(view);
	var listConcept = [];
	var listEdges = [];
	Object.keys(myView.getNodeData()).forEach(item => {
	 	console.log(item);
		var tiddlyItem = $tm.adapter.getTiddlerById(item);
		listConcept.push(tiddlyItem);
		var edges = $tm.adapter.getEdges(tiddlyItem);
		Object.keys(edges).forEach(itemEdge => {
			console.log(edges[itemEdge].type);
			var edge = edges[itemEdge].type
			if(listEdges.indexOf(edge) === -1) {
				listEdges.push(edges[itemEdge].type);
			}
		})

	});
	listConcept;
	var nodeKw = { title: "Rs__Research", initResearch:true, research: titleResearch, graphsNodeResearch: listConcept, graphsEdgesResearch: listEdges} ;
	$tw.wiki.addTiddler(nodeKw);


	}


})();