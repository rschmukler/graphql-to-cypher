import extend from 'extend';
import { parse } from 'graphql/lib/language/parser';
import { execute } from 'graphql/lib/executor/executor';
import { validateDocument } from 'graphql/lib/validator';
import { toGraphQLType } from './utils';

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

    let seenFields = [];
    let nestedResults = [];
    let nextOps = [];


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
            let {cypher} = typeForField(field).buildCypher(node, ctx);
            delete node._alreadyProcessing;
            seenFields.push(field);
            nestedResults.push(cypher);
            return false;
          }
          seenFields.push(field);
          return null;
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

    return { cypher: cypher, nextOps: nextOps };

    function handleField(field) {
      field = extend(true, {}, field);
      namespaceVars(field);
      addFieldToResults(field);
      addAdditionalRelations(field);
      addClauses(field);
    }

    function namespaceVars(field) {
      let propsWithPossibleVars = ['srcField', 'relation', 'clause'];
      let renamedVars = {};
      propsWithPossibleVars.forEach(prop => {
        if (field[prop]) {
          field[prop] = field[prop].replace(/(?:\{|\(|\[|^)\s*(\w+)/g, (str,placeholderVar, index) => {
            if (index == 0 && prop == 'clause') return str;
            let replaceWith;
            if (placeholderVar == 'n') {
              replaceWith = varName;
            } else if (ctx.length > 1) {
              replaceWith = varName + placeholderVar;
            } else {
              replaceWith = placeholderVar;
            }
            renamedVars[placeholderVar] = replaceWith;
            let res = str.replace(placeholderVar, replaceWith);
            return res;
          });
        }
      });
      if (field.clause) {
        for (var originVar in renamedVars) {
          field.clause = field.clause.replace(new RegExp('\\b' + originVar + '\\b', 'g'), renamedVars[originVar]);
        }
      }
    }

    function addAdditionalRelations({relation, srcField, outField}) {
      if (!relation) return;
      relation = `MATCH ${relation}`;
      extraQueries.push(relation);
    }

    function addClauses({clause}) {
      if (!clause) return;
      extraQueries.push(clause);
    }

    function addFieldToResults({type, srcField, outField, arrayMode}) {
      let nested = isNode(type);
      if (arrayMode) {
        srcField = `COLLECT(${srcField})`;
      }
      resultsFields.push(`${outField}: ${srcField}`);
    }
  }
  toGraphQL() {
    if (this._graphQLObject) return this._graphQLObject;
    let self = this;
    console.log(this.name);


    return this._graphQLObject = new GraphQLObjectType({
      name: this.name,
      description: this.description,
      fields: () => {
        console.log(self.name + ' - calling origin');
        let originFields = self.fields();
        let graphQLFields = {};
        Object.keys(originFields).forEach(convertField);
        function convertField(fieldName) {
          let field = originFields[fieldName];
          graphQLFields[fieldName] = {
            name: field.name,
            description: field.description,
            type: toGraphQLType(field.type),
            resolve: () => {}
          };
        }
      }
    });
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
