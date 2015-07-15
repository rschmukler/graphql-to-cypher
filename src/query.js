import Node from './node';
import { GraphQLSchema } from 'graphql/lib/type';
import { replaceVar, isNode } from './utils';

export default class Query extends Node {
  constructor(opts) {
    super(opts);
  }

  toSchema() {
    return new GraphQLSchema({
      query: this.toGraphQL()
    });
  }

  buildFields() {
    let fields = this.fields();
    for (var fieldName in fields) {
      if (isNode(fields[fieldName].type)) {
        if (!fields[fieldName].query) {
          throw Error(`Missing query for "${fieldName}" on query ${this.name}`);
        } else {
          let query = fields[fieldName].query.replace(/MATCH /, '');
          fields[fieldName].relation = query;
          fields[fieldName].srcField = 'n';
          delete fields[fieldName].query;
        }
      }
    }
    return this._fields = super.buildFields(fields);
  }
  buildCypher(opts = {}) {
    opts.noCtxShift = true;
    return super.buildCypher(opts);
  }
}
