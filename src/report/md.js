'use strict';

const fs = require('fs');
const utils = require('../utils');
const filter = require('./filter');

module.exports = {
  write: function(data, spec) {
    toMarkdown(data, spec);
  },
};

function toMarkdown(allRoutes, spec) {
  let content = '';

  allRoutes.sort(function(a, b) {
    return a[spec.sortBy].localeCompare(b[spec.sortBy]);
  });

  const filtered = filter.apply(allRoutes, spec.filter);

  filtered.forEach(route => {
    // skip if type doesn't match (filter list)
    if (spec.type !== undefined && route.type !== undefined && route.type !== spec.type) {
      return;
    }
    content += '| ';

    spec.fields.forEach(field => {
      let val = utils.resolveValue(field, route);

      if (val === null) {
        val = '';
      }

      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }

      content += val + ' | ';
    });

    content += '\n';
  });

  console.log('Writing report to file: ' + spec.output);
  fs.writeFileSync(spec.output, content);
}
