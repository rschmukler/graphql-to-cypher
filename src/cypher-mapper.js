import { parse } from 'graphql/lib/language/parser';
import { execute } from 'graphql/lib/executor/executor';
import { validateDocument } from 'graphql/lib/validator';

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
    return this;
  }

  query(name, type, description, query) {
    this._fields[name] = {
      type,
      description
    };
    this._fields[name].resolve = () => { return Promise.resolve(query); };
    return this;
  }

  buildGraphQLSchema() {
    var self = this;
    if (this._schema) return this._schema;

    var graphQlObj = new GraphQLObjectType({
      name: self._name,
      description: self._description,
      fields: () => {
        var schemaFields = {};
        for (var fieldName in self._fields) {
          let field = self._fields[fieldName];
          let type = graphQLTypeFor(field.type);
          schemaFields[fieldName] = {
            description: field.description,
            type: type,
            resolve: field.resolve
          };
        }
        return schemaFields;
      }
    });

    return this._schema = graphQlObj;

    function graphQLTypeFor(type) {
      if (type == 'string') return GraphQLString;
      if (type == self) return graphQlObj;
    }
  }

  async toCypher(queryString, nodeName) {

    var ast = parse(queryString);
    var schema = new GraphQLSchema({query: this.buildGraphQLSchema() });

    let { isValid, errors } = validateDocument(schema, ast);

    if (!isValid) {
      throw Error(errors[0].message);
    }

    var result = await execute(schema, Object, ast);


    const NODE_REGEX = /\bn\b/g;

    let cypherQuery = [];
    for (var fieldName of Object.keys(result.data)) {
      var field = this._fields[fieldName];

      var string = `WITH ${nodeName}\n`;
      if (isPrimitive(field.type)) {
        var srcField = buildSrc(field.srcField);
        string += `${srcField} as ${fieldName}`;
      } else {
        var query = await field.resolve();
        query = query.replace(NODE_REGEX, nodeName);
        string += `MATCH ${query}`;
      }
      cypherQuery.push(string);
    }
    return cypherQuery.join('\n');


    function buildSrc(src) {
      let nodePlaceholders = src.match(NODE_REGEX);
      if (nodePlaceholders && nodePlaceholders.length) {
        return src.replace(NODE_REGEX, nodeName);
      } else {
        return `${nodeName}.${src}`;
      }
    }

  }

}

const PRIMITIVES = [
  'string', 'number'
];

function isPrimitive(type) {
  return PRIMITIVES.includes(type);
}
