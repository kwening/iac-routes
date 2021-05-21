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
    return printData(allData, item);
  }

  item.content.forEach(itemKey => {
    let subItem = allData.get(itemKey);

    if (subItem.spec.type === 'file') {
      writeFile(allData, subItem);
    } else if (subItem.spec.type === 'tab') {
      writeSheet(allData, subItem);
    } else if (item.content !== undefined) {
      return resolveContent(allData, subItem);
    } else {
      return printData(allData, subItem);
    }
  });
}

function printData(allData, item) {
  let ws = getCurrentWorksheet();

  let row = ws.addRow(spec.fields);

  row.fill = {
    type: 'pattern',
    pattern: 'darkVertical',
    fgColor: {argb: 'FF666666'},
  };
  row.font = { name: 'Comic Sans MS', family: 4, size: 12, bold: true };
  row.commit();

  item.data.forEach((route) => {
    row = ws.addRow(getRow(route));
    row.commit();
  });

  // ws.addRows(rows);
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

function writeSheet(allData, item) {
  console.log(item);
  currentWorksheet = currentWorkbook.addWorksheet(item.header);

  resolveContent(allData, item);
}

function writeFile(allData, item) {
  currentWorkbook = new Excel.Workbook();
  currentWorkbook .properties.outlineLevelCol = 1;

  resolveContent(allData, item);

  let filename = utils.replaceVars(spec.output, item);

  console.log('Writing report to file: ' + filename);

  currentWorkbook.xlsx.writeFile(filename)
    .then(function() {
      // done
    });
}

function getCurrentWorksheet() {
  if (currentWorksheet === undefined) {
    currentWorksheet = currentWorkbook.addWorksheet('Routes');
  }

  return currentWorksheet;
}
