'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CypherMapper = (function () {
  function CypherMapper(name, description) {
    _classCallCheck(this, CypherMapper);

    if (!name) throw new Error('Name is required');
    if (!description) throw new Error('Description is required');
    this._name = name;
    this._description = description;
    this._fields = {};
  }

  _createClass(CypherMapper, [{
    key: 'expose',
    value: function expose(name, type, description) {
      if (!description) throw Error('Description is required for field "' + name + '"');
      var aliases = name.split('as');
      var fieldName = undefined,
          srcField = undefined;
      if (aliases.length == 2) {
        fieldName = aliases[1].trim();
        srcField = aliases[0].trim();
      } else {
        fieldName = srcField = aliases[0].trim();
      }
      this._fields[fieldName] = {
        srcField: srcField,
        description: description,
        type: type
      };
    }
  }]);

  return CypherMapper;
})();

exports['default'] = CypherMapper;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN5cGhlci1tYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUFxQixZQUFZO0FBQ3BCLFdBRFEsWUFBWSxDQUNuQixJQUFJLEVBQUUsV0FBVyxFQUFFOzBCQURaLFlBQVk7O0FBRTdCLFFBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQy9DLFFBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzdELFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COztlQVBrQixZQUFZOztXQVN6QixnQkFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtBQUM5QixVQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sS0FBSyx5Q0FBdUMsSUFBSSxPQUFJLENBQUM7QUFDN0UsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixVQUFJLFNBQVMsWUFBQTtVQUFFLFFBQVEsWUFBQSxDQUFDO0FBQ3hCLFVBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7QUFDdkIsaUJBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDOUIsZ0JBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDOUIsTUFBTTtBQUNMLGlCQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUMxQztBQUNELFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUc7QUFDeEIsZ0JBQVEsRUFBUixRQUFRO0FBQ1IsbUJBQVcsRUFBWCxXQUFXO0FBQ1gsWUFBSSxFQUFKLElBQUk7T0FDTCxDQUFDO0tBQ0g7OztTQXhCa0IsWUFBWTs7O3FCQUFaLFlBQVkiLCJmaWxlIjoiY3lwaGVyLW1hcHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIEN5cGhlck1hcHBlciB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIGRlc2NyaXB0aW9uKSB7XG4gICAgaWYgKCFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ05hbWUgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIWRlc2NyaXB0aW9uKSB0aHJvdyBuZXcgRXJyb3IoJ0Rlc2NyaXB0aW9uIGlzIHJlcXVpcmVkJyk7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB0aGlzLl9maWVsZHMgPSB7fTtcbiAgfVxuXG4gIGV4cG9zZShuYW1lLCB0eXBlLCBkZXNjcmlwdGlvbikge1xuICAgIGlmICghZGVzY3JpcHRpb24pIHRocm93IEVycm9yKGBEZXNjcmlwdGlvbiBpcyByZXF1aXJlZCBmb3IgZmllbGQgXCIke25hbWV9XCJgKTtcbiAgICBsZXQgYWxpYXNlcyA9IG5hbWUuc3BsaXQoJ2FzJyk7XG4gICAgbGV0IGZpZWxkTmFtZSwgc3JjRmllbGQ7XG4gICAgaWYgKGFsaWFzZXMubGVuZ3RoID09IDIpIHtcbiAgICAgIGZpZWxkTmFtZSA9IGFsaWFzZXNbMV0udHJpbSgpO1xuICAgICAgc3JjRmllbGQgPSBhbGlhc2VzWzBdLnRyaW0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmllbGROYW1lID0gc3JjRmllbGQgPSBhbGlhc2VzWzBdLnRyaW0oKTtcbiAgICB9XG4gICAgdGhpcy5fZmllbGRzW2ZpZWxkTmFtZV0gPSB7XG4gICAgICBzcmNGaWVsZCxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgdHlwZVxuICAgIH07XG4gIH1cbn1cbiJdfQ==