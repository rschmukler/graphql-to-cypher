export default class CypherMapper {
  constructor(name, description) {
    if (!name) throw new Error('Name is required');
    if (!description) throw new Error('Description is required');
    this._name = name;
    this._description = description;
    this._fields = {};
  }

  expose(name, type, description) {
    if (!description) throw Error(`Description is required for field "${name}"`);
    let aliases = name.split('as');
    let fieldName, srcField;
    if (aliases.length == 2) {
      fieldName = aliases[1].trim();
      srcField = aliases[0].trim();
    } else {
      fieldName = srcField = aliases[0].trim();
    }
    this._fields[fieldName] = {
      srcField,
      description,
      type
    };
  }
}
