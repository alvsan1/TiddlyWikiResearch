/*\
title: $:/plugins/alvsan/semantic/persistResearch
type: application/javascript
module-type: startup

\*/


const N3 = require('n3');
const { DataFactory, Writer } = N3;
const { namedNode, literal, blankNode } = DataFactory;

const SPARQL_UPDATE_URL = "http://192.168.1.134:3030/obi-instance/"; // Endpoint de Apache Jena
	
function tiddlerToTTL(tiddlerRow) {
	let tiddler = JSON.parse(tiddlerRow)
	const base = "http://example.org/research/";
  const id = tiddler.title.replace(/\s+/g, "_").toLowerCase();
  const subj = namedNode(base + id);

  const writer = new Writer({ prefixes: {
  }});

  writer.addQuad(subj, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://purl.obolibrary.org/obo/OBI_0000270')); // obi:investigation
  writer.addQuad(subj, namedNode('http://www.w3.org/2000/01/rdf-schema#label'), literal(tiddler.title));
  if (tiddler.description) writer.addQuad(subj, namedNode('http://purl.org/dc/elements/1.1/description'), literal(tiddler.description));

  const authors = tiddler.authors ? tiddler.authors.split('|').map(a => a.trim()) : [];
  authors.forEach((author, i) => {
    const personURI = `${base}author_${i}_${id}`;
    writer.addQuad(namedNode(personURI), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://purl.obolibrary.org/obo/OBI_0000093')); // person
    writer.addQuad(namedNode(personURI), namedNode('http://www.w3.org/2000/01/rdf-schema#label'), literal(author));
    writer.addQuad(namedNode(personURI), namedNode('http://purl.obolibrary.org/obo/IAO_0000300'), literal('Autor'));
    writer.addQuad(subj, namedNode('http://purl.obolibrary.org/obo/OBI_has_participant'), namedNode(personURI));
  });

  /*const concepts = tiddler.concepts ? tiddler.concepts.split(',').map(c => c.trim()) : [];
  concepts.forEach(c => writer.addQuad(subj, namedNode('obi:has_specified_input'), namedNode(`${baseURI}${c}`)));*/

  return new Promise((resolve, reject) => writer.end((err, result) => writer.end((err, result) => {
			  if (err) {
			    console.error("Error al serializar RDF:", err);
			    return;
			  }

			  persistToJena(result); // aquí ya tenés el TTL como string
			})
  ));
}


async function obiInstancesToTTL(researchTitle) {
  const instances = $tw.wiki.filterTiddlers("[tag[obi-instance]obi_part_of[" + researchTitle + "]!prefix[Draft of ]]");

  const seenCodings = new Map(); // Clave única por código + sistema

  for (const title of instances) {
    const t = $tw.wiki.getTiddler(title).fields;
    const base = "http://example.org/instance/";
    const subj = namedNode(base + encodeURIComponent(title.replace(/\s+/g, "_")));

    const writer = new Writer({
      prefixes: {}
    });

    // rdf:type
    if (t["obi_class"]) {
      writer.addQuad(subj, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode(t["obi_class"]));
    }

    // rdfs:label
    if (t["rdfs:label"]) {
      writer.addQuad(subj, namedNode("http://www.w3.org/2000/01/rdf-schema#label"), literal(t["rdfs:label"]));
    }

    // obi:part_of
    writer.addQuad(
      subj,
      namedNode("http://purl.obolibrary.org/obo/OBI_0000312"),
      namedNode("http://example.org/research/" + encodeURIComponent(researchTitle.replace(/\s+/g, "_")))
    );

    // fhir:Coding con IRI fijo en lugar de blank node
    if (t["fhir:Coding.code_code"] && t["fhir:Coding.system_uri"]) {
      const codingBase = "http://example.org/coding/";
      // Crear un IRI único basado en el código y sistema
      const uriParts = t["fhir:Coding.system_uri"].split('/').filter(Boolean);
      const codeSystem = uriParts[uriParts.length - 1];
      const codingId = `${encodeURIComponent(codeSystem)}-${encodeURIComponent(t["fhir:Coding.code_code"])}`;
      const codingIRI = namedNode(codingBase + codingId);

      // Solo añadir la definición del Coding si no lo hemos visto antes
      if (!seenCodings.has(codingId)) {
        seenCodings.set(codingId, true);
        
        writer.addQuad(codingIRI, namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://hl7.org/fhir/Coding"));
        writer.addQuad(codingIRI, namedNode("http://hl7.org/fhir/code"), literal(t["fhir:Coding.code_code"]));
        writer.addQuad(codingIRI, namedNode("http://hl7.org/fhir/system"), namedNode(t["fhir:Coding.system_uri"]));
        
        if ("fhir:Coding.userSelected_value" in t) {
          writer.addQuad(
            codingIRI,
            namedNode("http://hl7.org/fhir/userSelected"),
            literal(t["fhir:Coding.userSelected_value"], namedNode("http://www.w3.org/2001/XMLSchema#boolean"))
          );
        }
      }

      // Añadir la relación entre la instancia y el Coding
      writer.addQuad(subj, namedNode("http://purl.obolibrary.org/obo/OBI_0001938"), codingIRI);
    }

    // obo:IAO_0000136 (is_about)
    if (t["obi:has_value_specification"] && t["class"]) {
      writer.addQuad(
        subj,
        namedNode("http://purl.obolibrary.org/obo/IAO_0000136"),
        namedNode(`http://hl7.org/fhir/${t["obi:has_value_specification"]}`)
      );
    }

    // Serialización
    await new Promise((resolve, reject) => {
      writer.end((err, result) => {
        if (err) reject(err);
        else {
          persistToJena(result);
          resolve();
        }
      });
    });
  }
}


function persistToJena(ttl) {

	console.log(ttl)

	var Client = require("node-rest-client").Client;
  var client = new Client();

  const prefixes = `
PREFIX obi: <http://purl.obolibrary.org/obo/>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX fhir: <http://hl7.org/fhir/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  `.trim();

  const sanitized = ttl.replace(/\s*\n\s*/g, ' ').trim(); // elimina saltos de línea
  console.log("sanitizedTTL : ")
  console.log(sanitized);
  console.log("prefixes : ")
  console.log(prefixes);
  const sparql = `${prefixes}\nINSERT DATA { GRAPH <http://example.org/graph/investigaciones> { ${sanitized} } }`;
  console.log("pasa")
  console.log(sparql);

  var args = {
        headers: { "Accept": "application/ld+json, */*;q=0.5", "Content-Type": "application/sparql-update" }, // request headers 
  	    data: sparql
    };

  client.post(SPARQL_UPDATE_URL, args, function (data, response) {
	  if (response.statusCode < 200 || response.statusCode >= 300) {
	    const errText = response.statusMessage || data.toString();
	    console.error("SPARQL Update failed:", response.statusCode, errText);
	    throw new Error("SPARQL Update failed: " + errText);
	  } else {

	    console.log("SPARQL Update succeeded");
	  }
	});

} 

( function(){

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "persistResearch";
	exports.platforms = ["node"];
	exports.after = ["story"];
	exports.synchronous = true;


	exports.startup = function(callback) {

		$tw.wiki.addEventListener("change",function(changes) {
			try {
			 var nodeResearch = $tw.wiki.filterTiddlers("[save[true]]");
				nodeResearch.forEach( function (nodeName) {
					console.log("-------------------------SaveResearch-------------------------------");
					let patt = /Draft of/;
	        if ( ! patt.test(nodeName) ){
	          var researchJson = $tw.wiki.getTiddlerAsJson(nodeName);
	          tiddlerToTTL(researchJson);
	          obiInstancesToTTL(nodeName);

	          // Setear save en false después del procesamiento
						$tw.wiki.addTiddler(new $tw.Tiddler(
							$tw.wiki.getTiddler(nodeName),
							{ save: "false" }
						));

	    		}
	    	});	


	    	// Triggear refresh del wiki
				if (nodeResearch.length > 0) {
					$tw.wiki.enqueueTiddlerEvent("refresh");
				}     
		  }catch (err) {
		    console.error(err);
			}
	  });
	}
})();



