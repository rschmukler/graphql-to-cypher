import { parse } from 'graphql/lib/language/parser';
import { visit } from 'graphql/lib/language/visitor';
import { execute } from 'graphql/lib/executor';
import { validateDocument } from 'graphql/lib/validator';

import neo4j from 'neo4j-promised-cypher';

export default class Executor {
  constructor(host, query) {
    if (!host) throw new Error('No host specified');
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
    let processed = root.buildCypher({ast: ast.definitions[0], params: params });
    params = processed.params;
    let {cypher} = processed;
    cypher += 'result \nRETURN result';
    let dbResult = (await this._db.query(cypher, params)).result;

    let result = {};
    let rootSelections = ast.definitions[0].selectionSet.selections;

    for (let sel of rootSelections) {
      result[sel.alias.value] = dbResult[sel.name.value];
    }

    return result;
  }
}
