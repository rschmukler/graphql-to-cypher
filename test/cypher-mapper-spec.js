import expect from 'expect.js';
import { CypherMapper } from '../dist/';

describe('CypherMapper', () => {
  var testMapper;

  beforeEach(() => {
    testMapper = new CypherMapper('Test', 'test mapper');
  });

  it('exists', () => {
    expect(CypherMapper).to.be.ok();
  });

  describe('#contructor', () => {
    it('requires the name', () => {
      var noName = () => { return new CypherMapper(); };
      expect(noName).to.throwError('Name is required');
    });
    it('requires the description', () => {
      var noDesc = () => { return new CypherMapper('Test'); };
      expect(noDesc).to.throwError(/Description is required/);
    });
    it('sets initializes the instance', () => {
      expect(testMapper._name).to.be('Test');
      expect(testMapper._description).to.be('test mapper');
      expect(testMapper._fields).to.eql({});
    });
  });

  describe('#expose', () => {
    it('adds it to the field map', () => {
      testMapper.expose('name', 'string', 'The name');
      expect(testMapper._fields).to.have.property('name');
      expect(testMapper._fields.name).to.eql({
        srcField: 'name',
        description: 'The name',
        type: 'string'
      });
    });

    it('expands aliases', () => {
      testMapper.expose('id(n) as id', 'number', 'The id');
      expect(testMapper._fields).to.have.property('id');
      expect(testMapper._fields.id).to.eql({
        srcField: 'id(n)',
        description: 'The id',
        type: 'number'
      });
    });
    it('requires a name');
    it('requires a type');
    it('requires a description', () => {
      var noDescription = () => { testMapper.expose('id', 'number'); };
      expect(noDescription).to.throwError(/Description is required for field "id"/);
    });
    it('returns itself');
  });

  describe('#toCypher', () => {
    it('errors on an invalid query');
    it('expands out related types');
    it('includes primitive fields', () => {
      testMapper.expose('name', 'string', 'The name');
      testMapper._nodeName = 'n';
      let result = testMapper.toCypher('{name}', result);
      expect(result).to.be(`
      WITH n.name as name
      `.replace(/\n/g, ''));
    });
  });
});
