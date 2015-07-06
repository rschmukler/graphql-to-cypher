'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _graphqlLibLanguageParser = require('graphql/lib/language/parser');

var _graphqlLibExecutorExecutor = require('graphql/lib/executor/executor');

var _graphql = require('graphql');

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
  }, {
    key: 'toCypher',
    value: function toCypher(queryString) {
      var parsedAST, schema, results, fields, cypherQuery;
      return regeneratorRuntime.async(function toCypher$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            parsedAST = (0, _graphqlLibLanguageParser.parse)(queryString);
            schema = new _graphql.GraphQLSchema({
              query: new _graphql.GraphQLObjectType({
                name: 'RootQueryType',
                fields: {
                  name: {
                    type: _graphql.GraphQLString,
                    resolve: function resolve() {
                      return 'name';
                    }
                  }
                }
              })
            });
            context$2$0.next = 4;
            return regeneratorRuntime.awrap((0, _graphqlLibExecutorExecutor.execute)(schema, {}, parsedAST));

          case 4:
            results = context$2$0.sent;
            fields = results.data;
            cypherQuery = Object.keys(fields).map(function (field) {
              var string = 'WITH ';
              string += _this._nodeName + '.' + field + ' as ' + field;
              return string;
            });
            return context$2$0.abrupt('return', cypherQuery.join('\n'));

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return CypherMapper;
})();

exports['default'] = CypherMapper;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN5cGhlci1tYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozt3Q0FBc0IsNkJBQTZCOzswQ0FDM0IsK0JBQStCOzt1QkFPaEQsU0FBUzs7SUFFSyxZQUFZO0FBQ3BCLFdBRFEsWUFBWSxDQUNuQixJQUFJLEVBQUUsV0FBVyxFQUFFOzBCQURaLFlBQVk7O0FBRTdCLFFBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQy9DLFFBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzdELFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COztlQVBrQixZQUFZOztXQVN6QixnQkFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtBQUM5QixVQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sS0FBSyx5Q0FBdUMsSUFBSSxPQUFJLENBQUM7QUFDN0UsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixVQUFJLFNBQVMsWUFBQTtVQUFFLFFBQVEsWUFBQSxDQUFDO0FBQ3hCLFVBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7QUFDdkIsaUJBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDOUIsZ0JBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDOUIsTUFBTTtBQUNMLGlCQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUMxQztBQUNELFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUc7QUFDeEIsZ0JBQVEsRUFBUixRQUFRO0FBQ1IsbUJBQVcsRUFBWCxXQUFXO0FBQ1gsWUFBSSxFQUFKLElBQUk7T0FDTCxDQUFDO0tBQ0g7OztXQUVhLGtCQUFDLFdBQVc7VUFDcEIsU0FBUyxFQUVULE1BQU0sRUFZTixPQUFPLEVBQ1AsTUFBTSxFQUVOLFdBQVc7Ozs7OztBQWpCWCxxQkFBUyxHQUFHLDhCQXJDWCxLQUFLLEVBcUNZLFdBQVcsQ0FBQztBQUU5QixrQkFBTSxHQUFHLGFBbENmLGFBQWEsQ0FrQ29CO0FBQzdCLG1CQUFLLEVBQUUsYUFsQ1gsaUJBQWlCLENBa0NnQjtBQUMzQixvQkFBSSxFQUFFLGVBQWU7QUFDckIsc0JBQU0sRUFBRTtBQUNOLHNCQUFJLEVBQUU7QUFDSix3QkFBSSxXQXJDZCxhQUFhLEFBcUNnQjtBQUNuQiwyQkFBTyxFQUFFOzZCQUFNLE1BQU07cUJBQUE7bUJBQ3RCO2lCQUNGO2VBQ0YsQ0FBQzthQUNILENBQUM7OzRDQUVrQixnQ0FsRGYsT0FBTyxFQWtEZ0IsTUFBTSxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUM7OztBQUE5QyxtQkFBTztBQUNQLGtCQUFNLEdBQUcsT0FBTyxDQUFDLElBQUk7QUFFckIsdUJBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNuRCxrQkFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLG9CQUFNLElBQU8sTUFBSyxTQUFTLFNBQUksS0FBSyxZQUFPLEtBQUssQUFBRSxDQUFDO0FBQ25ELHFCQUFPLE1BQU0sQ0FBQzthQUNmLENBQUM7Z0RBRUssV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7S0FDOUI7OztTQW5Ea0IsWUFBWTs7O3FCQUFaLFlBQVkiLCJmaWxlIjoiY3lwaGVyLW1hcHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBhcnNlIH0gZnJvbSAnZ3JhcGhxbC9saWIvbGFuZ3VhZ2UvcGFyc2VyJztcbmltcG9ydCB7IGV4ZWN1dGUgfSBmcm9tICdncmFwaHFsL2xpYi9leGVjdXRvci9leGVjdXRvcic7XG5cbmltcG9ydCB7XG4gIGdyYXBocWwsXG4gIEdyYXBoUUxTY2hlbWEsXG4gIEdyYXBoUUxPYmplY3RUeXBlLFxuICBHcmFwaFFMU3RyaW5nXG59IGZyb20gJ2dyYXBocWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDeXBoZXJNYXBwZXIge1xuICBjb25zdHJ1Y3RvcihuYW1lLCBkZXNjcmlwdGlvbikge1xuICAgIGlmICghbmFtZSkgdGhyb3cgbmV3IEVycm9yKCdOYW1lIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFkZXNjcmlwdGlvbikgdGhyb3cgbmV3IEVycm9yKCdEZXNjcmlwdGlvbiBpcyByZXF1aXJlZCcpO1xuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIHRoaXMuX2Rlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgdGhpcy5fZmllbGRzID0ge307XG4gIH1cblxuICBleHBvc2UobmFtZSwgdHlwZSwgZGVzY3JpcHRpb24pIHtcbiAgICBpZiAoIWRlc2NyaXB0aW9uKSB0aHJvdyBFcnJvcihgRGVzY3JpcHRpb24gaXMgcmVxdWlyZWQgZm9yIGZpZWxkIFwiJHtuYW1lfVwiYCk7XG4gICAgbGV0IGFsaWFzZXMgPSBuYW1lLnNwbGl0KCdhcycpO1xuICAgIGxldCBmaWVsZE5hbWUsIHNyY0ZpZWxkO1xuICAgIGlmIChhbGlhc2VzLmxlbmd0aCA9PSAyKSB7XG4gICAgICBmaWVsZE5hbWUgPSBhbGlhc2VzWzFdLnRyaW0oKTtcbiAgICAgIHNyY0ZpZWxkID0gYWxpYXNlc1swXS50cmltKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpZWxkTmFtZSA9IHNyY0ZpZWxkID0gYWxpYXNlc1swXS50cmltKCk7XG4gICAgfVxuICAgIHRoaXMuX2ZpZWxkc1tmaWVsZE5hbWVdID0ge1xuICAgICAgc3JjRmllbGQsXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIHR5cGVcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgdG9DeXBoZXIocXVlcnlTdHJpbmcpIHtcbiAgICB2YXIgcGFyc2VkQVNUID0gcGFyc2UocXVlcnlTdHJpbmcpO1xuXG4gICAgdmFyIHNjaGVtYSA9IG5ldyBHcmFwaFFMU2NoZW1hKHtcbiAgICAgIHF1ZXJ5OiBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgICAgICBuYW1lOiAnUm9vdFF1ZXJ5VHlwZScsXG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgIHR5cGU6IEdyYXBoUUxTdHJpbmcsXG4gICAgICAgICAgICByZXNvbHZlOiAoKSA9PiAnbmFtZSdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSk7XG5cbiAgICB2YXIgcmVzdWx0cyA9IGF3YWl0IGV4ZWN1dGUoc2NoZW1hLCB7fSwgcGFyc2VkQVNUKTtcbiAgICB2YXIgZmllbGRzID0gcmVzdWx0cy5kYXRhO1xuXG4gICAgdmFyIGN5cGhlclF1ZXJ5ID0gT2JqZWN0LmtleXMoZmllbGRzKS5tYXAoKGZpZWxkKSA9PiB7XG4gICAgICB2YXIgc3RyaW5nID0gXCJXSVRIIFwiO1xuICAgICAgc3RyaW5nICs9IGAke3RoaXMuX25vZGVOYW1lfS4ke2ZpZWxkfSBhcyAke2ZpZWxkfWA7XG4gICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGN5cGhlclF1ZXJ5LmpvaW4oJ1xcbicpO1xuICB9XG59XG4iXX0=