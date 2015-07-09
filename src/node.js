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
      } else if (isNode(field.type)) {
        if (!field.relation) throw Error(`Missing relation query on relation field "${fieldName}" on Node "${self.name}"`);
        return {
          type: field.type,
          outField: field.outField || fieldName,
          srcField: field.srcField || fieldName,
          relation: field.relation
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
    if (!Array.isArray(ctx)) ctx = [ctx];
    let varName = ctx[0];
    let name = this.name;
    let possibleFields = this.buildFields();
    let cypher = '';
    let newAst, result;

    let seenFields = [];
    let nestedResults = [];

    visit(ast, {
      Field: {
        enter(node) {
          let fieldName = node.name.value;
          if (node._alreadyProcessing) return;

          let field = possibleFields[fieldName];
          if (!field) throw Error(`Attempted to access undefined field "${fieldName}" on node ${name}`);

          if (isNode(field.type)) {
            node._alreadyProcessing = true;
            let nestedVarName = varName + field.srcField;
            ctx.unshift(nestedVarName);
            let [cypher] = typeForField(field).buildCypher(node, ctx);
            delete node._alreadyProcessing;
            seenFields.push(field);
            nestedResults.push(cypher);
            return false;
          }
          seenFields.push(field);
        }
      }
    });

    let resultsFields = [];
    let extraQueries = [];

    seenFields.forEach(handleField);

    cypher += arrayToStr(extraQueries);
    cypher += arrayToStr(nestedResults);
    cypher += `WITH { ${resultsFields.join(', ')} } as ${ctx.join(', ')}`;
    ctx.shift();

    return [cypher, newAst, result];

    function handleField(field) {
      addFieldToResults(field);
      addAdditionalRelations(field);
    }

    function addAdditionalRelations({relation, srcField, outField}) {
      if (!relation) return;
      relation = `MATCH ${relation}`;
      relation = relation.replace(srcField, varName + srcField);
      relation = replaceVar(relation, varName);
      extraQueries.push(relation);
    }

    function addFieldToResults({type, srcField, outField}) {
      let nested = isNode(type);
      let replaceWith;
      if (nested) {
        replaceWith = varName + srcField;
      } else {
        replaceWith = replaceVar(srcField, varName);
      }

      if (isArray(type)) {
        replaceWith = `COLLECT(${replaceWith})`;
      }
      resultsFields.push(`${outField}: ${replaceWith}`);
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

function arrayToStr(arr) {
  return arr.join('\n') + (arr.length ? '\n' : '');
}

function isNode(type) {
  return type instanceof Node || type[0] instanceof Node;
}

const PRIMITIVES = [
  'string', 'number'
];

function typeForField({type}) {
  return isArray(type) ? type[0] : type;
}

function isPrimitive(type) {
  return PRIMITIVES.includes(type);
}

function isArray(type) {
  return Array.isArray(type);
}
