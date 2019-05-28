'use strict';

const Excel = require('exceljs');
const utils = require('../utils');
const reportutils = require('./utils');

var spec;
var currentWorkbook;
var currentWorksheet;

module.exports = {
  write: function(data, s) {
    spec = s;
    toXlsx(data, spec);
  },
};

function toXlsx(allRoutes, spec) {
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
  let rows = [];

  if (item.header !== 'undefined') {
    rows.push([item.header]);
  }

  item.data.forEach((route) => {
    rows.push(getRow(route));
  });

  currentWorksheet.addRows(rows);
}

function getRow(route) {
  let row = [];

  spec.fields.forEach(field => {
    let val = utils.resolveValue(field, route);

    if (val === null) {
      val = '';
    }

    if (typeof val === 'object') {
      val = JSON.stringify(val);
    }

    row.push(val);
  });

  return row;
}

function writeFile(allData, item) {
  currentWorkbook = new Excel.Workbook();
  currentWorksheet = currentWorkbook.addWorksheet('Routes');

  resolveContent(allData, item);

  let filename = utils.replaceVars(spec.output, item);

  console.log('Writing report to file: ' + filename);

  currentWorkbook.xlsx.writeFile(filename)
    .then(function() {
      // done
    });
}
