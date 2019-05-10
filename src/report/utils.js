'use strict';

const utils = require('../utils');

module.exports = {
  sortBy: function(data, field) {
    return sortBy(data, field);
  },
  filter: function(data, filters, mode) {
    return filter(data, filters, mode);
  },
  groupBy: function(data, groupSpec) {
    return groupBy(data, groupSpec);
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

function filter(data, filters, mode) {
  if (mode !== undefined) {
    data = data.filter(function(item) {
      // skip if type doesn't match (filter list)
      return (item.type !== undefined && item.type !== mode);
    });
  }

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

function groupBy(data, groupSpec) {
  if (groupSpec === undefined) {
    return {type: 'none', groups: new Map([['all', {data: data}]])};
  }

  let obj = {type: '', groups: []};

  if (Array.isArray(groupSpec)) {
    groupSpec.forEach(spec => {
      obj.groups = applyGroupSpec(data, spec.field);
      obj.type = spec.type;
    });
  }

  return obj;
}

function applyGroupSpec(data, field) {
  return data.reduce(function(rv, x) {
    let groupKey = utils.resolveValue(field, x);

    if (rv.size === undefined) {
      rv = new Map();
    }

    let group = rv.get(groupKey);

    if (group === undefined) {
      group = {data: [x], header: groupKey};
    } else {
      group.data.push(x);
    }

    rv.set(groupKey, group);
    return rv;
  }, Map);
}
