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
  /* if (mode !== undefined) {
    data = data.filter(function(item) {
      // skip if type doesn't match (filter list)
      return (item.type !== undefined && item.type !== mode);
    });
  }*/

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
  // Default groupSpec
  if (groupSpec === undefined) {
    // return {type: 'none', groups: new Map([['all', {data: data}]])};
    groupSpec = [{ type: 'file'}];
  }

  let result = new Map([['start', {data: data}]]);
  let grouped = new Map();

  groupSpec.forEach(spec => {
    console.log('Grouping by ' + spec.field);

    result.forEach((value, key, map) => {
      result = applyGroupSpec(value.data, spec, key);
      value.content = [ ...result.keys()];
      delete value.data;
      grouped.set(key, value);

      grouped = new Map([...grouped, ...result]);
    });
  });

  console.log(grouped);

  return grouped;
}

function applyGroupSpec(data, spec, prefix) {
  if (spec.field === undefined) {
    return new Map([['all', {data: data, spec: spec, header: ''}]]);
  }

  return data.reduce(function(rv, x) {
    let groupKey = utils.resolveValue(spec.field, x);
    let prefixedKey = prefix + '.' + groupKey;

    if (rv.size === undefined) {
      rv = new Map();
    }

    let group = rv.get(prefixedKey);

    if (group === undefined) {
      group = {data: [x], header: groupKey};
    } else {
      group.data.push(x);
    }

    group.spec = spec;

    rv.set(prefixedKey, group);
    return rv;
  }, Map);
}
