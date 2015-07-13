import expect from 'expect.js';

import { parse } from 'graphql/lib/language/parser';

import { Node } from '../dist/';

import {
  GraphQLObjectType,
  GraphQLString,
  Visitor
} from 'graphql';

describe('Node', () => {
  describe('#buildCypher', () => {
    it('handles a simple field', () => {
      let node = new Node({
        name: 'Person',
        description: 'Test',
        fields: () => ({
          name: 'string'
        })
      });
      let ast = parse('{ name }');
      let [cypher, newAst, ret] = node.buildCypher(ast, 'n');
      expect(cypher).to.equal('WITH { name: n.name } as n');
    });

    it('handles a predicate field', () => {
      let node = new Node({
        name: 'Person',
        description: 'Test',
        fields: () => ({
          id: {
            type: 'int',
            srcField: 'id(n)'
          }
        })
      });
      let ast = parse('{ id }');
      let [cypher, newAst, ret] = node.buildCypher(ast, 'n');
      expect(cypher).to.equal('WITH { id: id(n) } as n');
    });


    describe('variable parsing', () => {
      it('errors if a primitive field does not include a variable', () => {
        let makeBadModel = () => {
          let Person = new Node({
            name: 'Person',
            description: 'Test',
            fields: () => ({
              name: {
                type: 'string',
                srcField: 'name'
              },
              friends: {
                type: [ Person ],
                relation: '(n)-[:IS_FRIENDS_WITH]-(friends:Person)'
              },
              isOlderThan: {
                type: 'boolean',
                srcField: 'n.age > { age }'
              }
            })
          });
          Person.buildFields();
        };
        expect(makeBadModel).to.throwError(/Missing argument "age" for field "isOlderThan"/);
      });

      it('handles variable passing', () => {
        let Person = new Node({
          name: 'Person',
          description: 'Test',
          fields: () => ({
            name: {
              type: 'string',
              srcField: 'name'
            },
            friends: {
              type: [ Person ],
              relation: '(n)-[:IS_FRIENDS_WITH]-(friends:Person)'
            },
            isOlderThan: {
              type: Boolean,
              srcField: 'n.age > { age }',
              args: {
                age: {
                  type: 'int',
                  defaultValue: 20
                }
              }
            }
          })
        });
        let graphQl = '{ name,  isOlderThan(age: 40)}';
        let ast = parse(graphQl);
        let [cypher, newAst, ret] = Person.buildCypher(ast, 'n');
        expectCypher(cypher, `WITH { name: n.name, isOlderThan: n.age > { age } } as n`);
      });
    });

    describe.only('relations', () => {
      it('handles single nodes', () => {
        let Person = new Node({
          name: 'Person',
          description: 'Test',
          fields: () => ({
            name: 'string',
            onlyFriend: {
              type: Person,
              relation: '(n)-[:IS_ONLY_FRIENDS_WITH]-(onlyFriend:Person)'
            }
          })
        });
        let ast = parse('{ name onlyFriend { name } }');
        let [cypher, newAst, ret] = Person.buildCypher(ast, 'n');
        expectCypher(cypher, `
          MATCH (n)-[:IS_ONLY_FRIENDS_WITH]-(onlyFriend:Person)
          WITH { name: onlyFriend.name } as onlyFriend, n
          WITH { name: n.name, onlyFriend: onlyFriend } as n
        `);
      });

      it('handles an array of related types', () => {
        let Person = new Node({
          name: 'Person',
          description: 'Test',
          fields: () => ({
            name: {
              type: 'string',
              srcField: 'name'
            },
            friends: {
              type: [ Person ],
              relation: '(n)-[:IS_FRIENDS_WITH]-(friends:Person)'
            }
          })
        });

        let ast = parse('{ name friends { name } }');
        let [cypher, newAst, ret] = Person.buildCypher(ast, 'n');
        expectCypher(cypher, `
          MATCH (n)-[:IS_FRIENDS_WITH]-(friends:Person)
          WITH { name: friends.name } as friends, n
          WITH { name: n.name, friends: COLLECT(friends) } as n
        `);
      });

      it('handles deeply nested types', () => {
        let Food = new Node({
          name: 'Food',
          description: 'A tasty treat',
          fields: () => ({ name: 'string' })
        });
        let Person = new Node({
          name: 'Person',
          description: 'Test',
          fields: () => ({
            name: {
              type: 'string',
              srcField: 'name'
            },
            friends: {
              type: [ Person ],
              relation: '(n)-[:IS_FRIENDS_WITH]-(friends:Person)'
            },
            favoriteFoods: {
              type: [ Food ],
              relation: '(n)-[:LIKES]->(favoriteFoods:Food)'
            }
          })
        });

        let graphQl = '{ name, friends { name, favoriteFoods { name } }}';
        let ast = parse(graphQl);
        let [cypher, newAst, ret] = Person.buildCypher(ast, 'n');
        expectCypher(cypher, `
          MATCH (n)-[:IS_FRIENDS_WITH]-(friends:Person)
          MATCH (friends)-[:LIKES]->(friendsfavoriteFoods:Food)
          WITH { name: friendsfavoriteFoods.name } as friendsfavoriteFoods, friends, n
          WITH { name: friends.name, favoriteFoods: COLLECT(friendsfavoriteFoods) } as friends, n
          WITH { name: n.name, friends: COLLECT(friends) } as n
        `);
      });

      it('handles clauses', () => {
        let Person = new Node({
          name: 'Person',
          description: 'Test',
          fields: () => ({
            name: 'string',
            newFriends: {
              type: [ Person ],
              relation: '(n)-[a:IS_FRIENDS_WITH]-(newFriends:Person)',
              clause: 'ORDER BY a.createdOn LIMIT { limit }',
              args: {
                limit: 10
              }
            }
          })
        });
        let ast = parse('{ name, newFriends(limit: 10) { name } }');
        let [cypher] = Person.buildCypher(ast, 'n');
        expectCypher(cypher, `
          MATCH (n)-[a:IS_FRIENDS_WITH]-(newFriends:Person)
          ORDER BY a.createdOn LIMIT { limit }
          WITH { name: newFriends.name } as newFriends, n
          WITH { name: n.name, newFriends: COLLECT(newFriends) } as n
        `);
      });

      it('handles deeply nested clauses', () => {
        let Person = new Node({
          name: 'Person',
          description: 'Test',
          fields: () => ({
            name: 'string',
            newFriends: {
              type: [ Person ],
              relation: '(n)-[a:IS_FRIENDS_WITH]-(newFriends:Person)',
              clause: 'ORDER BY a.createdOn LIMIT { limit }',
              args: {
                limit: 10
              }
            }
          })
        });
        let ast = parse('{ name, newFriends(limit: 10) { name newFriends(limit: 5) { name }} }');
        let [cypher] = Person.buildCypher(ast, 'n');
        expectCypher(cypher, `
          MATCH (n)-[a:IS_FRIENDS_WITH]-(newFriends:Person)
          ORDER BY a.createdOn LIMIT { limit }
          MATCH (newFriends)-[newFriendsa:IS_FRIENDS_WITH]-(newFriendsnewFriends:Person)
          ORDER BY newFriendsa.createdOn LIMIT { newFriendslimit }
          WITH { name: newFriendsnewFriends.name } as newFriendsnewFriends, newFriends, n
          WITH { name: newFriends.name, newFriends: COLLECT(newFriendsnewFriends) } as newFriends, n
          WITH { name: n.name, newFriends: COLLECT(newFriends) } as n
        `);
      });
    });
  });
});

function expectCypher(result, query) {
  expect(normalize(result)).to.be(normalize(query));

  function normalize(str) {
    return str.replace(/\n/g, ' ').replace(/ +/g, ' ').trim();
  }
}
