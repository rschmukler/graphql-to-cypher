import { parse } from 'graphql/lib/language/parser';
import { execute } from 'graphql/lib/executor/executor';
import { validateDocument } from 'graphql/lib/validator';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
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
    var arrayMode = Array.isArray(type);
    if (arrayMode) type = type[0];

    this._fields[name] = {
      type,
      description
    };
    this._fields[name].resolve = () => { return Promise.resolve(query); };
    this._fields[name].arrayMode = arrayMode;
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
            resolve: field.resolve,
            arrayMode: field.arrayMode
          };
        }
        return schemaFields;
      }
    });

    return this._schema = graphQlObj;

    function graphQLTypeFor(type) {
      let result;
      let arrayMode = Array.isArray(type);
      if (arrayMode) type = type[0];
      if (type == 'string') result = GraphQLString;
      else if (type.buildGraphQLSchema) result = type.buildGraphQLSchema();

      return arrayMode && isPrimitive(type) ? new GraphQLList(result) : result;
    }
  }

  async toCypher(queryString, nodeName = 'n', ctx = []) {
    var ast = parse(queryString);
    var schema = new GraphQLSchema({query: this.buildGraphQLSchema() });

    let { isValid, errors } = validateDocument(schema, ast);


    if (!isValid) {
      throw Error(errors[0].message);
    }

    const NODE_REGEX = /\bn\b/g;

    var result = await execute(schema, {name: true, friends: { name: 'Test'}}, ast);

    var fields = this._fields;
    return await processFields(result.data, fields, nodeName, ctx);


    async function processFields(obj, fields, nodeName, ctx) {
      ctx.unshift(nodeName);
      let advancedQueries = [];
      let primitiveFields = [];
      let tmpString;
      for (var fieldName of Object.keys(obj)) {
        var field = fields[fieldName];
        let srcField;
        if (!isPrimitive(field.type)) {
          srcField = nodeName + fieldName;
          var query = await field.resolve();
          query = query.replace(NODE_REGEX, nodeName).replace(variableRegex(fieldName), srcField);
          tmpString = `MATCH ${query}`;
          advancedQueries.push(tmpString);
          let innerQuery = await processFields(obj[fieldName], fields[fieldName].type._fields, srcField, ctx);
          advancedQueries.push(innerQuery);
        } else {
          srcField = buildSrc(field.srcField);
        }
        if (field.arrayMode) srcField = `COLLECT(${srcField})`;
        tmpString = `${fieldName}: ${srcField}`;
        primitiveFields.push(tmpString);
      }
      let queryStr = advancedQueries.join('\n') + '\n';
      queryStr += `WITH { ${primitiveFields.join(', ')} } as ${ctx.join(', ')}`;
      ctx.shift();
      return queryStr;

      function buildSrc(src) {
        let nodePlaceholders = src.match(NODE_REGEX);
        if (nodePlaceholders && nodePlaceholders.length) {
          return src.replace(NODE_REGEX, nodeName);
        } else {
          return `${nodeName}.${src}`;
        }
      }
    }

    function variableRegex(variableName) {
      return new RegExp('\\b' + variableName + '\\b', 'g');
    }
  }

}

const PRIMITIVES = [
  'string', 'number'
];

function isPrimitive(type) {
  return PRIMITIVES.includes(type);
}
