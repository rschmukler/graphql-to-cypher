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
    let root = this._rootQuery;
    let schema = root.toSchema();
    let validationResult = validateDocument(schema, ast);
    if (!validationResult.isValid) {
      throw Error(validationResult.errors[0].message);
    }
    root.buildFields();
    let result = root.buildCypher({ast: ast });
    console.log(result.cypher);
    let res = (await this._db.query(result.cypher + 'result \nRETURN result', params)).result;
  }
}
