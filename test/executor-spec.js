import expect from 'expect.js';
import { Executor, Node } from '../dist/';

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

  describe('buildCypher', () => {
    describe('Node', () => {
      let Person;
      before(() => {
        Person = new Node({
          name: 'Person',
          description: 'A person',
          fields: () => ({
            name: 'string'
          })
        });
      });

      it('handles a simple field', () => {
        executor.buildCypher(`{
          alias:name, age, friends {
            name
          }
        }`);
      });
    });
  });

  describe('run', () => {
    it('builds the query');
    it('runs the query');
    it('returns the result');
  });
});
