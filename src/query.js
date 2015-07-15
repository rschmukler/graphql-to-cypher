import Node from './node';
import { GraphQLSchema } from 'graphql/lib/type';

export default class Query extends Node {
  constructor(opts) {
    super(opts);
  }

  toSchema() {
    return new GraphQLSchema({
      query: this.toGraphQL()
    });
  }
}
