'use strict';

const fs = require('fs');
const utils = require('../utils');
const reportutils = require('./utils');

var spec;

module.exports = {
  write: function(data, s) {
    spec = s;
    toMarkdown(data);
  },
};

function toMarkdown(allRoutes) {
  allRoutes = reportutils.filter(allRoutes, spec.filter, spec.mode);
  allRoutes = reportutils.sortBy(allRoutes, spec.sortBy);
  allRoutes = reportutils.groupBy(allRoutes, spec.groupBy);

  resolveContent(allRoutes, allRoutes.get('start'));
}

function resolveContent(allData, item) {
  if (item.data !== undefined) {
    return printData(item);
  }

  item.content.forEach(itemKey => {
    let subItem = allData.get(itemKey);

    if (subItem.spec.type === 'file') {
      writeFile(allData, subItem);
    } else if (item.content !== undefined) {
      return resolveContent(allData, subItem);
    } else {
      return printData(subItem);
    }
  });
}

function printData(item) {
  let content = '';

  if (item.header !== 'undefined') {
    content += '## ' + item.header + '\n\n';
  }

  item.data.forEach((route) => {
    content += getRow(route);
  });

  content += '\n';

  return content;
}

function getRow(route) {
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

function writeFile(allData, item) {
  let content = '';
  content += resolveContent(allData, item);

  let filename = utils.replaceVars(spec.output, item);

  console.log('Writing report to file: ' + filename);
  fs.writeFileSync(filename, content);
}
