'use strict';

const utils = require('../utils');

module.exports = {
  sortBy: function(data, field) {
    return sortBy(data, field);
  },
  filter: function(data, filters) {
    return filter(data, filters);
  },
  groupBy: function(data, field) {
    return groupBy(data, field);
  },
};

function sortBy(data, field) {
  if (field === undefined) {
    return data;
  }

  return data.sort(function(a, b) {
    return a[field].localeCompare(b[field]);
  });
}

function filter(data, filters) {
  if (filters === undefined) {
    return data;
  }

  return data.filter(function(item) {
    let matches = true;

    filters.forEach((filterItem) => {
      for (var key in filterItem) {
        if (item[key].indexOf(filterItem[key]) === -1) {
          matches = false;
        }
      }
    });

    return matches;
  });
}

function groupBy(data, field) {
  if (field === undefined) {
    return {all: data};
  }

  return data.reduce(function(rv, x) {
    let val = utils.resolveValue(field, x);
    (rv[val] = rv[val] || []).push(x);
    return rv;
  }, {});
}
