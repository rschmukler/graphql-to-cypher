import { parse } from 'graphql/lib/language/parser';
import { execute } from 'graphql/lib/executor/executor';
import { validateDocument } from 'graphql/lib/validator';

import { visit } from 'graphql/lib/language/visitor';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

const NODE_REGEX = /\bn\b/g;

export default class Node {
  constructor({name, fields}) {
    this.name = name;
    this.fields = fields;
  }
  buildFields() {
    let self = this;
    if (this._fields) return this._fields;
    let fields = this.fields();

    for (var fieldName in fields) {
      fields[fieldName] = parseField(fieldName, fields[fieldName]);
    }
    return this._fields = fields;

    function parseField(fieldName, field) {
      if (typeof field == 'string') {
        return {
          srcField: toVar(fieldName),
          outField: fieldName,
          type: field
        };
      } else if (field.type instanceof Node) {
        if (!field.query) throw Error(`Missing query on relation field "${fieldName}" on Node "${self.name}"`);
        return {
          type: field.type,
          outField: field.outField || fieldName,
          srcField: field.srcField || fieldName,
          query: field.query
        };
      } else {
        return {
          srcField: toVar(field.srcField),
          outField: field.outField || fieldName,
          type: field.type
        };
      }
    }
  }
  buildCypher(ast, ctx) {
    let varName = Array.isArray(ctx) ? ctx.shift() : ctx;
    let name = this.name;
    let fields = this.buildFields();
    let cypher = '';
    let newAst, result;

    let results = [];

    visit(ast, {
      Field: {
        enter({ name: {value: fieldName }}) {
          let field = fields[fieldName];
          if (!field) throw Error(`Attempted to access undefined field "${fieldName}" on node ${name}`);
          results.push(field);
        }
      }
    });

    let resultsCypher = results.reverse().map(handleField).join(', ');
    cypher += `WITH { ${resultsCypher} } as ${varName}`;

    return [cypher, newAst, result];

    function handleField({type, srcField, outField}) {
      return `${outField}: ${replaceVar(srcField, varName)}`;
    }
  }
}

function toVar(field) {
  if (!NODE_REGEX.test(field)) {
    return 'n.' + field;
  }
  return field;
}

function replaceVar(field, newName) {
  return field.replace(NODE_REGEX, newName);
}

const PRIMITIVES = [
  'string', 'number'
];

function isPrimitive(type) {
  return PRIMITIVES.includes(type);
}
