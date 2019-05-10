'use strict';

const fs = require('fs');
const utils = require('../utils');
const reportutils = require('./utils');

module.exports = {
  write: function(data, spec) {
    toMarkdown(data, spec);
  },
};

function toMarkdown(allRoutes, spec) {
  let content = '';

  allRoutes = reportutils.sortBy(allRoutes, spec.sortBy);
  const filtered = reportutils.filter(allRoutes, spec.filter, spec.mode);
  const grouped = reportutils.groupBy(filtered, spec.groupBy);

  grouped.groups.forEach(group => {
    if (grouped.type === 'row') {
      content += '| ' + group.header + '|\n';
    }

    if (group.data !== undefined) {
      group.data.forEach((route) => {
        content += getRow(route, spec);
      });
    }
  });

  console.log('Writing report to file: ' + spec.output);
  fs.writeFileSync(spec.output, content);
}

function getRow(route, spec) {
  let content = '| ';

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

  return content;
}
