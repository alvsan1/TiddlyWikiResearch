/*\
title: $:/plugins/alvsan/semantic/persist.js
type: application/javascript
module-type: macro
\*/

(function(){

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  exports.name = "persist";

  exports.params = [{name: "titleResearch"}];

  exports.run = function(titleResearch) {
    const payload = {
      subject: "http://example.org/obs1",
      predicate: "http://example.org/hasValue",
      object: "42"
    };
     
    var data = JSON.parse($tw.wiki.getTiddlerAsJson(titleResearch));

    // Si estás usando fetch()
    fetch('/persist-research', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'TiddlyWiki',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(json => alert("Guardado: " + JSON.stringify(json)))
    .catch(err => alert("Error: " + err.message));

  };

})();
