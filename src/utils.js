'use strict';

module.exports = {
  resolveValue: function(path, obj) {
    return path.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : null;
    }, obj || null);
  },
};
