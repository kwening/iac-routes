'use strict';

module.exports = {
  resolveValue: function(path, obj) {
    return resolveValue(path, obj);
  },
  replaceVars: function(text, item) {
    let regexp = /\{([A-Z\.]*)\}/gi;

    text.replace(regexp, function(match, key) {
      text = text.replace(match, resolveValue(key, item));
    });

    return text;
  },
};

function resolveValue(path, obj) {
  return path.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : null;
  }, obj || null);
}
