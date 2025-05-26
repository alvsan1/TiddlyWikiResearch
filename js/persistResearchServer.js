/*\
title: $:/plugins/alvsan/semantic/persistResearchServer.js
type: application/javascript
module-type: route
\*/

const N3 = require('n3');
const { DataFactory, Writer } = N3;
const { namedNode, literal, quad } = DataFactory;

const SPARQL_ENDPOINT = "http://localhost:3030/ds/update";

exports.method = "POST";

exports.path = /^\/persist-research$/;

exports.handler = async function(request, response, state) {
  try {
    let body = '';
    request.on('data', chunk => body += chunk);
    request.on('end', async () => {
      const { subject, predicate, object } = JSON.parse(body);

      const writer = new Writer();
      writer.addQuad(quad(
        namedNode(subject),
        namedNode(predicate),
        literal(object)
      ));

      writer.end(async (error, ttl) => {
        const query = `
          INSERT DATA {
            ${ttl}
          }
        `;

        const sparqlResponse = await fetch(SPARQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/sparql-update" },
          body: query
        });

        if (sparqlResponse.ok) {
          response.writeHead(200, {"Content-Type": "application/json"});
          response.end(JSON.stringify({status: "ok"}));
        } else {
          response.writeHead(500, {"Content-Type": "application/json"});
          response.end(JSON.stringify({error: "SPARQL error"}));
        }
      });
    });
  } catch (err) {
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({error: err.message}));
  }
};
