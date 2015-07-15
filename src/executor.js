import { parse } from 'graphql/lib/language/parser';
import { visit } from 'graphql/lib/language/visitor';
import { validateDocument } from 'graphql/lib/validator';

import neo4j from 'neo4j-promised-cypher';

export default class Executor {
  constructor(host, query) {
    if (!host) throw new Error('No host specified');
    //if (!schema) throw new Error('No schema specified');
    this._db = neo4j(host);
    this._rootQuery = query;
  }
  async run(query, params = {}) {
    var ast = parse(query);
    let schema = this._rootQuery.toSchema();
    let validationResult = validateDocument(schema, ast);
    console.log(schema._schemaConfig.query._fields);
    if (!validationResult.isValid) {
      throw Error(validationResult.errors[0].message);
    }
    return {};
  }
}
