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
  GraphQLString,
} from 'graphql/lib/type';

import Node from './node';

export var toGraphQLType = (type, {required} = {}) => {
  let result, arrayMode = false;

  if (Array.isArray(type)) {
    if (type.length == 1) {
      type = type[0];
      arrayMode = true;
    }
  }

  switch (type) {
    case String:
    case 'string': result = GraphQLString; break;
    case 'int': result = GraphQLInt; break;
    case Number:
    case 'float': result = GraphQLFloat; break;
  }

  if (type instanceof Node) {
    result = type.toGraphQL();
  }

  if (arrayMode) result = new GraphQLList(result);
  if (required) result = new GraphQLNonNull(result);
  return result;
};
