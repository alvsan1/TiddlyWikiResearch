/*\
title: $:/plugins/alvsan/semantic/js/loadResearch
type: application/javascript
module-type: startup
Semantic research processing
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Export name and synchronous status
exports.name = "loadResearch";
exports.platforms = ["browser"];
exports.after = ["story"];
exports.synchronous = true;

exports.startup = function(callback) {
	

  if (window.addEventListener) {
    window.addEventListener("message", function(event) {
		  if (event.data && event.data.type === "formDataChanged") {
		    console.log(event);

		    const schema = event.data.schema;
		    const contextTiddler = event.data.context || "default";
		    const timestamp = new Date().toISOString();

		    const tiddlerTitle = `$:/data/${schema}/${contextTiddler}`;

		    const newText = JSON.stringify(event.data.data, null, 2);

		    $tw.wiki.addTiddler(new $tw.Tiddler({
		      title: tiddlerTitle,
		      type: "application/json",
		      text: newText,
		      schema,
		      "form-origin": contextTiddler,
		      created: timestamp
		    }));

		    console.log("📦 Formulario persistido:", tiddlerTitle);
		  }
		});
  }



	// create a new listener
	$tw.wiki.addEventListener("change",function(changes) {
		var nodeResearch = $tw.wiki.filterTiddlers("[research[true]]");
		nodeResearch.forEach( function (nodeName) {
			let patt = /Draft of/;
            if ( ! patt.test(nodeName) ){
	            var nodeJSON = $tw.wiki.getTiddlerAsJson(nodeName);
	            
	            if ( JSON.parse(nodeJSON).research ){
	                console.log(JSON.parse(nodeJSON))
	                console.log("-----------------Actualizando Research----------------------/n");

	                //["research"];

	                //Create Environment Research
	                var labelResearch
	                if ( JSON.parse(nodeJSON).label ){
	                	labelResearch = JSON.parse(nodeJSON).label;
	                }else{
	                	labelResearch = JSON.parse(nodeJSON).title;
	                }	          	                
	                var titleResearch = JSON.parse(nodeJSON).title;
	                var newViewResearch = new $tm.ViewAbstraction( labelResearch, { isCreate: true});
	                newViewResearch.setConfig({physics_mode: true });

	                $tw.wiki.setText(titleResearch,"titleResearch",0,labelResearch,"");
	                //$tw.wiki.getTiddler("$:/linekedhealth/research_view");
	                $tw.wiki.setText(titleResearch,"text",0,$tw.wiki.getTiddler("$:/linkedhealth/research_view").fields.text,"");
	                $tw.wiki.setText(titleResearch,"research",0,"false","");
	                $tw.wiki.addTiddler(new $tw.Tiddler($tw.wiki.getTiddler(titleResearch),{tags: ["research"]}))









	                /*
	                newView.addNode( node );
	                newView.addPlaceholder( node );
	                newView.saveNodePosition(node);
	                */
	           	}
        	}
        });
    });
};

})();
