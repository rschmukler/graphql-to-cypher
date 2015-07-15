import expect from 'expect.js';
import { parse } from 'graphql/lib/language/parser';
import { Executor, Node, Enum, Query } from '../dist/';

import neo4j from 'neo4j-promised-cypher';

describe('Executor', () => {
  let executor;
  beforeEach( () => {
    executor = new Executor('localhost:7474');
  });
  describe('constructor', () => {
    it('requires a host string', () => {
      let noHost = () => new Executor();
      expect(noHost).to.throwError(/No host specified/);
    });

    it('sets the db', () => {
      let executor = new Executor('localhost:7474');
      expect(executor._db).to.be.ok();
    });
  });

  describe('e2e', () => {
    const ENDPOINT = 'http://neo4j:test@neo4j:7474';
    let rawDb, schema, executor;
    beforeEach(async () => {
      rawDb = neo4j(ENDPOINT);
      await rawDb.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r');
      await rawDb.query(`
      CREATE (a:Person { name: 'Bob', age: 30 })
      CREATE (b:Person { name: 'Steve', age: 48 })
      CREATE (c:Person { name: 'Mark', age: 17 })
      CREATE (d:Person { name: 'Tina', age: 51 })

      CREATE (e:Food { name: 'Bacon', category: 'meat' })
      CREATE (f:Food { name: 'Cheese', category: 'dairy' })
      CREATE (g:Food { name: 'Milk', category: 'dairy' })
      CREATE (h:Food { name: 'Sausage', category: 'meat' })
      CREATE (i:Food { name: 'Chicken', category: 'meat' })
      CREATE (j:Food { name: 'Frogs Legs', category: 'meat' })

      CREATE (a)-[:IS_FRIENDS_WITH]->(b)
      CREATE (a)-[:IS_FRIENDS_WITH]->(c)
      CREATE (a)-[:IS_FRIENDS_WITH]->(d)
      CREATE (b)-[:IS_FRIENDS_WITH]->(d)
      CREATE (c)-[:IS_FRIENDS_WITH]->(d)

      CREATE (a)-[:LIKES_FOOD]->(e)
      CREATE (b)-[:LIKES_FOOD]->(e)
      CREATE (c)-[:LIKES_FOOD]->(e)
      CREATE (d)-[:LIKES_FOOD]->(e)
      CREATE (a)-[:LIKES_FOOD]->(f)
      CREATE (b)-[:LIKES_FOOD]->(g)
      CREATE (c)-[:LIKES_FOOD]->(h)
      CREATE (d)-[:LIKES_FOOD]->(i)
      CREATE (d)-[:LIKES_FOOD]->(j)
      CREATE (c)-[:LIKES_FOOD]->(f)
      CREATE (i)-[:TASTES_LIKE]->(j)
      `);

      let FoodCategory = new Enum({
        name: 'Food Categories',
        description: 'A type of food',
        values: {
          MEAT: {
            value: 'meat',
            description: 'The tastiest of all foods'
          },
          VEGETABLE: {
            value: 'vegetable',
            description: 'The other living thing we eat'
          },
          DAIRY: {
            value: 'dairy',
            description: 'Doing Wisconsin proud'
          }
        }
      });

      let Food = new Node({
        name: 'Food',
        description: 'A tasty treat',
        fields: () => ({
          id: {
            type: 'int',
            srcField: 'id(n)'
          },
          name: 'string',
          category: FoodCategory,
          tastesLike: {
            type: [ Food ],
            relation: '(n)-[:TASTES_LIKE]-(tastesLike:Food)'
          }
        })
      });

      let Person = new Node({
        name: 'Person',
        description: 'A Person in the DB',
        fields: () => ({
          id: {
            type: 'int',
            srcField: 'id(n)'
          },
          name: 'string',
          age: 'int',
          friends: {
            type: [ Person ],
            relation: '(n)-[:IS_FRIENDS_WITH]-(friends:Person)'
          },
          likesFoods: {
            type: [ Food ],
            relation: '(n)-[:LIKES_FOOD]->(likesFoods:Food)'
          }
        })
      });

      schema = new Query({
        name: 'Root Level Query',
        description: 'The entry point of the TastyFoods API',
        fields: () => ({
          FindPerson: {
            type: Person,
            query: 'MATCH (n:Person { name: { name }})',
            args: {
              name: 'string'
            }
          }
        })
      });

      executor = new Executor(ENDPOINT, schema);
    });

    it('validates queries', async (done) => {
      try {
        await executor.run('{ invalid { name } }');
      } catch (e) {
        try {
          expect(e.message).to.match(/Cannot query field invalid on Root Level Query/);
        } catch(e) {
          done(e);
        }
        done();
      }
    });

    it.only('handles simple queries', async () => {
      let query = `{
        bob: FindPerson(name: $name) {
          name, age
        }
      }`;
      let result = await executor.run(query, { name: "Bob" });
      expect(result).to.be.ok();
    });
  });
});
