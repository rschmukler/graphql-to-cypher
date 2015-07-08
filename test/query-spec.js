import expect from 'expect.js';
import { Query } from '../dist/';

describe('Query', () => {
  it('can be constructed', () => {
    var q = new Query();
  });

  describe('#buildCypherSchema', () => {
    let query;
    beforeEach( () => {
      query = new Query({
        name: 'RootQuery',
        description: 'A test root query'
      });
    });

    it('builds the base definition', () => {
      expect(query.name).to.be('RootQuery');
      expect(query.description).to.be('A test root query');
    });
    it('supports nodes');
  });
});
