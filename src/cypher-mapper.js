import { parse } from 'graphql/lib/language/parser';
import { execute } from 'graphql/lib/executor/executor';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

export default class CypherMapper {
  constructor(name, description) {
    if (!name) throw new Error('Name is required');
    if (!description) throw new Error('Description is required');
    this._name = name;
    this._description = description;
    this._fields = {};
  }

  expose(name, type, description) {
    if (!description) throw Error(`Description is required for field "${name}"`);
    let aliases = name.split('as');
    let fieldName, srcField;
    if (aliases.length == 2) {
      fieldName = aliases[1].trim();
      srcField = aliases[0].trim();
    } else {
      fieldName = srcField = aliases[0].trim();
    }
    this._fields[fieldName] = {
      srcField,
      description,
      type
    };
  }

  async toCypher(queryString) {
    var parsedAST = parse(queryString);

    var schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          name: {
            type: GraphQLString,
            resolve: () => 'name'
          }
        }
      })
    });

    var results = await execute(schema, {}, parsedAST);
    var fields = results.data;

    var cypherQuery = Object.keys(fields).map((field) => {
      var string = "WITH ";
      string += `${this._nodeName}.${field} as ${field}`;
      return string;
    });

    return cypherQuery.join('\n');
  }
}
