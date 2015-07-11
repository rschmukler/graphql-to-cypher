import extend from 'extend';
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
      fields[fieldName] = parseDefinition(fieldName, fields[fieldName]);
    }
    return this._fields = fields;

    function parseDefinition(fieldName, fieldDefinition) {
      let result = {
        arrayMode: isArray(fieldDefinition.type),
        srcField: normalizeField(fieldDefinition.srcField || fieldName),
        outField: fieldDefinition.outField || fieldName,
        type: fieldDefinition.type,
        relation: fieldDefinition.relation,
        clause: fieldDefinition.clause
      };
      if (typeof fieldDefinition == 'string') {
        return extend(result, { type: fieldDefinition });
      } else if (isNode(fieldDefinition.type)) {
        if (!fieldDefinition.relation) throw Error(`Missing relation query on relation field "${fieldName}" on Node "${self.name}"`);
        extend(result, {
          srcField: fieldDefinition.srcField || fieldName
        });
      }
      ensureArgs();
      return result;

      function ensureArgs() {
        fieldDefinition.args = fieldDefinition.args || {};
        let vars = getVariablesFromCypher(result.srcField);
        vars.forEach( varName => {
          if (!fieldDefinition.args[varName])
            throw Error(`Missing argument "${varName}" for field "${fieldName}"`);
        });
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
            let nestedVarName = ctx.length > 1 ? varName + field.srcField : field.srcField;
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
      field = extend(true, {}, field);
      namespaceVars(field);
      addFieldToResults(field);
      addAdditionalRelations(field);
    }

    function namespaceVars(field) {
      let propsWithPossibleVars = ['srcField', 'relation', 'clause'];
      propsWithPossibleVars.forEach(prop => {
        if (field[prop]) {
          field[prop] = field[prop].replace(/(?:\(|\[|^)(\w+)/g, (str,placeholderVar, index) => {
            let replaceWith;
            if (placeholderVar == 'n') {
              replaceWith = varName;
            } else if (ctx.length > 1) {
              replaceWith = varName + placeholderVar;
            } else {
              replaceWith = placeholderVar;
            }
            let res = str.replace(placeholderVar, replaceWith);
            return res;
          });
        }
      });
    }

    function addAdditionalRelations({relation, srcField, outField}) {
      if (!relation) return;
      relation = `MATCH ${relation}`;
      extraQueries.push(relation);
    }

    function addFieldToResults({type, srcField, outField, arrayMode}) {
      let nested = isNode(type);
      if (arrayMode) {
        srcField = `COLLECT(${srcField})`;
      }
      resultsFields.push(`${outField}: ${srcField}`);
    }
  }
}

function nodeRegex({global} = {}) {
  if (global) global = 'g';
  return new RegExp(/\bn\b/, global);
}

function normalizeField(field) {
  if (!nodeRegex().test(field)) {
    return 'n.' + field;
  }
  return field;
}

function replaceVar(str, oldName, newName) {
  if (!newName) {
    newName = oldName;
    oldName = 'n';
  }
  let regex = new RegExp(`\\b${oldName}\\b`,'g');
  return str.replace(regex, newName);
}

function arrayToStr(arr) {
  return arr.join('\n') + (arr.length ? '\n' : '');
}

function isNode(type) {
  return type instanceof Node || type[0] instanceof Node;
}

const PRIMITIVES = [
  'string', 'int', 'float', 'boolean'
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

function getVariablesFromCypher(cypher) {
  let varRegex = /\{\s*(\w+)\s*\}/g;
  let vars = cypher.match(varRegex);

  if (!vars) return [];
  return vars.map( x => x.replace(/\{|\}/g, '').trim());
}
