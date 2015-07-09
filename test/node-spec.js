import expect from 'expect.js';

import { parse } from 'graphql/lib/language/parser';

import { Node } from '../dist/';

import {
  GraphQLObjectType,
  GraphQLString,
  Visitor
} from 'graphql';

describe.only('Node', () => {
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
            type: 'number',
            srcField: 'id(n)'
          }
        })
      });
      let ast = parse('{ id }');
      let [cypher, newAst, ret] = node.buildCypher(ast, 'n');
      expect(cypher).to.equal('WITH { id: id(n) } as n');
    });

    it('handles single nodes', () => {
      let Person = new Node({
        name: 'Person',
        description: 'Test',
        fields: () => ({
          name: {
            type: 'string',
            srcField: 'name'
          },
          onlyFriend: {
            type: Person,
            query: '(n)-[:IS_ONLY_FRIENDS_WITH]-(onlyFriend:Person)'
          }
        })
      });
      let ast = parse('{ onlyFriend { name } }');
      let [cypher, newAst, ret] = Person.buildCypher(ast, 'n');
      expectCypher(cypher, `
        MATCH (n)-[:IS_ONLY_FRIENDS_WITH]->(nonlyFriend:Person)
        WITH { name: nonlyFriend.name } as nonlyFriend, n
        WITH { name: n.name, onlyFriend: nonlyFriend } as n
      `);
    });
//   it('expands out related types', async () => {
//     let Person = new Node('Person', 'A person');

//     Person
//       .expose('name', 'string', 'The name of the person')
//       .relation('bestFriend', Person, 'Friends of the person', '(n)-[:IS_BEST_FRIENDS_WITH]->(bestFriend:Person)');

//     let result = await Person.toCypher('{ name, bestFriend { name }}', 'n');
//     expectQuery(result, `
//     MATCH (n)-[:IS_BEST_FRIENDS_WITH]->(nbestFriend:Person)
//     WITH { name: nbestFriend.name } as nbestFriend, n
//     WITH { name: n.name, bestFriend: nbestFriend } as n
//     `);
//   });
  });
});

// describe.skip('Node', () => {
//   var testMapper;

//   beforeEach(() => {
//     testMapper = new Node('Test', 'test mapper');
//   });

//   it('exists', () => {
//     expect(Node).to.be.ok();
//   });

//   describe('#contructor', () => {
//     it('requires the name', () => {
//       var noName = () => { return new Node(); };
//       expect(noName).to.throwError('Name is required');
//     });
//     it('requires the description', () => {
//       var noDesc = () => { return new Node('Test'); };
//       expect(noDesc).to.throwError(/Description is required/);
//     });
//     it('sets initializes the instance', () => {
//       expect(testMapper._name).to.be('Test');
//       expect(testMapper._description).to.be('test mapper');
//       expect(testMapper._fields).to.eql({});
//     });
//   });

//   describe('#expose', () => {
//     it('requires a name', () => {
//       var noName = () => { testMapper.expose(); };
//       expect(noName).to.throwError(/Name is required for a field/);
//     });
//     it('requires a type', () => {
//       var noType = () => { testMapper.expose('id'); };
//       expect(noType).to.throwError(/Type is required for field "id"/);
//     });
//     it('requires a description', () => {
//       var noDescription = () => { testMapper.expose('id', 'number'); };
//       expect(noDescription).to.throwError(/Description is required for field "id"/);
//     });

//     it('returns itself', () => {
//       let result = testMapper.expose('test', 'string', 'test');
//       expect(result).to.be(testMapper);
//     });

//     it('adds it to the field map', () => {
//       testMapper.expose('name', 'string', 'The name');
//       expect(testMapper._fields).to.have.property('name');
//       expect(testMapper._fields.name).to.eql({
//         srcField: 'name',
//         description: 'The name',
//         type: 'string'
//       });
//     });

//     it('expands aliases', () => {
//       testMapper.expose('id(n) as id', 'number', 'The id');
//       expect(testMapper._fields).to.have.property('id');
//       expect(testMapper._fields.id).to.eql({
//         srcField: 'id(n)',
//         description: 'The id',
//         type: 'number'
//       });
//     });
//   });

//   describe('#relation', () => {
//     it('requires a name', () => {
//       var noName = () => testMapper.relation();
//       expect(noName).to.throwError(/Name is required for a relation/);
//     });
//     it('requires a type', () => {
//       var noType = () => testMapper.relation('friends');
//       expect(noType).to.throwError(/Type not specified for relation "friends"/);
//     });
//     it('requires a description', () => {
//       var noDescription = () => testMapper.relation('friends', {});
//       expect(noDescription).to.throwError(/Description not specified for relation "friends"/);
//     });
//     it('requires a cypher-query', () => {
//       var noQuery = () => testMapper.relation('friends', {}, 'test');
//       expect(noQuery).to.throwError(/Cypher query not specified for relation "friends"/);
//     });
//     it('returns itself', () => {
//       expect(testMapper.relation('favoriteFood', {}, 'Description', 'favoriteFood')).to.be(testMapper);
//     });

//     it('adds itself to the fields map', () => {
//       testMapper.relation('favoriteFood', {}, 'Description', 'favoriteFood');
//       expect(testMapper._fields.favoriteFood).to.be.ok();
//       expect(testMapper._fields.favoriteFood).to.have.property('type');
//       expect(testMapper._fields.favoriteFood).to.have.property('description', 'Description');
//       expect(testMapper._fields.favoriteFood.resolve).to.be.a(Function);
//     });

//     it('errors when a query misses a variable', () => {
//       var missingVar = () => { testMapper.relation('favoriteFood', {}, 'Description', '()'); };
//       expect(missingVar).to.throwError(/Relation "favoriteFood" did not provide a variable named "favoriteFood" in the neo4j query/);
//     });
//   });


//   describe('#buildCypherSchema', () => {
//     let result, fields;
//     beforeEach(() => {
//       testMapper.expose('name', 'string', 'Name');
//       testMapper.relation('link', testMapper, 'Link', '(n)-[:LINK]->(link)');
//       result = testMapper.buildCypherSchema();
//       fields = result._typeConfig.fields();
//     });

//     it('builds the base definition', () => {
//       expect(result.name).to.be('Test');
//       expect(result.description).to.be('test mapper');
//     });

//     it('supports strings', () => {
//       expect(fields.name).to.be.ok();
//       expect(fields.name.type).to.be(GraphQLString);
//       expect(fields.name.description).to.be('Name');
//     });

//     it('supports other Nodes', () => {
//       expect(fields.link).to.be.ok();
//       expect(fields.link.type).to.be.a(GraphQLObjectType);
//       expect(fields.link.description).to.be('Link');
//     });
//   });

//   describe('#toCypher', () => {
//     it('errors on an invalid query', (done) => {
//       testMapper.toCypher('{doesntExist}', 'n').then(undefined, (err) => {
//         try {
//           expect(err.message).to.match(/Cannot query field doesntExist on Test/);
//           done();
//         } catch(e) {
//           done(e);
//         }
//       });
//     });

//     it('includes primitive fields', async () => {
//       testMapper.expose('name', 'string', 'The name');
//       let result = await testMapper.toCypher('{name}', 'n');
//       expectQuery(result,`
//         WITH { name: n.name } as n
//       `);
//     });

//     it('handles alias fields', async () => {
//       testMapper.expose('id(n) as id', 'number', 'The id');
//       let result = await testMapper.toCypher('{id}', 'n');
//       expectQuery(result, `
//       WITH { id: id(n) } as n
//       `);
//     });

//     it('expands out related types', async () => {
//       let Person = new Node('Person', 'A person');

//       Person
//         .expose('name', 'string', 'The name of the person')
//         .relation('bestFriend', Person, 'Friends of the person', '(n)-[:IS_BEST_FRIENDS_WITH]->(bestFriend:Person)');

//       let result = await Person.toCypher('{ name, bestFriend { name }}', 'n');
//       expectQuery(result, `
//       MATCH (n)-[:IS_BEST_FRIENDS_WITH]->(nbestFriend:Person)
//       WITH { name: nbestFriend.name } as nbestFriend, n
//       WITH { name: n.name, bestFriend: nbestFriend } as n
//       `);
//     });

//     it('handles an array of related types', async () => {
//       let Person = new Node('Person', 'A person');

//       Person
//         .expose('name', 'string', 'The name of the person')
//         .relation('friends', [Person], 'Friends of the person', '(n)-[:IS_FRIENDS_WITH]-(friends:Person)');

//       let result = await Person.toCypher('{ name, friends { name }}', 'n');
//       expectQuery(result, `
//       MATCH (n)-[:IS_FRIENDS_WITH]-(nfriends:Person)
//       WITH { name: nfriends.name } as nfriends, n
//       WITH { name: n.name, friends: COLLECT(nfriends) } as n
//       `);
//     });

//     it('handles deeply nested types', async () => {
//       let Person = new Node('Person', 'A person');
//       let Food = new Node('Food', 'A tasty treat');

//       Food.expose('name', 'string', 'The name of the food');

//       Person
//         .expose('name', 'string', 'The name of the person')
//         .relation('favoriteFoods', [Food], 'The favorite foods of the person', '(n)-[:LIKES]->(favoriteFoods:Food)')
//         .relation('friends', [Person], 'Friends of the person', '(n)-[:IS_FRIENDS_WITH]-(friends:Person)');

//       let result = await Person.toCypher('{ name, friends { name, favoriteFoods { name } }}', 'n');
//       expectQuery(result, `
//         MATCH (n)-[:IS_FRIENDS_WITH]-(nfriends:Person)
//         MATCH (nfriends)-[:LIKES]->(nfriendsfavoriteFoods:Food)
//         WITH { name: nfriendsfavoriteFoods.name } as nfriendsfavoriteFoods, nfriends, n
//         WITH { name: nfriends.name, favoriteFoods: COLLECT(nfriendsfavoriteFoods) } as nfriends, n
//         WITH { name: n.name, friends: COLLECT(nfriends) } as n
//       `);
//     });
//   });
// });

function expectCypher(result, query) {
  expect(normalize(result)).to.be(normalize(query));

  function normalize(str) {
    return str.replace(/\n/g, ' ').replace(/ +/g, ' ').trim();
  }
}
