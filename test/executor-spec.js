import expect from 'expect.js';
import { Executor, Node } from '../dist/';

import neo4j from 'neo4j-promised-cypher';

describe.skip('Executor', () => {
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
    let rawDb;
    before(async () => {
      rawDb = neo4j('neo4j');
      await rawDb.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r');
    });
    it('builds the query');
    it('runs the query');
    it('returns the result');
  });
});
