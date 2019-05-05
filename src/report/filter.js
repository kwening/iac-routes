'use strict';

module.exports = {
  apply: function(data, filters) {
    return applyFilter(data, filters);
  },
};

function applyFilter(data, filters) {
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
