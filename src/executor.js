import { parse } from 'graphql/lib/language/parser';
import { visit } from 'graphql/lib/language/visitor';

import neo4j from 'neo4j-promised-cypher';

export default class Executor {
  constructor(host, schema) {
    if (!host) throw new Error('No host specified');
    //if (!schema) throw new Error('No schema specified');
    this._db = neo4j(host);
    this._schema = schema;
  }
  async run(schema, query, params) {
    let ast = parse(queryString);
    let [queryString, newAst] = this.buildQuery(ast);
  }
  buildCypher(ast) {
    visit(ast, {
      Field: {
        enter({ name: {value: fieldName }}) {
          console.log("Found field name %s", fieldName);
        }
      }
    });
  }
}
