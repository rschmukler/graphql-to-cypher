import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLString
} from 'graphql/lib/type';

import expect from 'expect.js';
import spyOn from 'mi6';

import Node from '../src/node';
import * as utils from '../src/utils';

describe('utils', () => {
  describe('.toGraphQLType', () => {
    let type = utils.toGraphQLType;
    it('handles "string"', () => {
      expect(type('string')).to.be(GraphQLString);
    });
    it('handles String', () => {
      expect(type(String)).to.be(GraphQLString);
    });
    it('handles "int"', () => {
      expect(type('int')).to.be(GraphQLInt);
    });
    it('handles "float"', () => {
      expect(type('float')).to.be(GraphQLFloat);
    });
    it('handles Number', () => {
      expect(type(Number)).to.be(GraphQLFloat);
    });
    it('handles nodes', () => {
      let node = new Node({});
      let called = false, result = {};
      spyOn(node, 'toGraphQL').calls(() => { called = true; return result; });
      expect(type(node)).to.be(result);
      expect(called).to.be(true);
      node.toGraphQL.restore();
    });
    it('handles arrays of primitives', () => {
      expect(type([String])).to.be.a(GraphQLList);
    });
    it('handles required', () => {
      expect(type(String, { required: true })).to.be.a(GraphQLNonNull);
    });
  });
});
