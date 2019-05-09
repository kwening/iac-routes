'use strict';

module.exports = {
  processData: function(data, spec) {
    console.log('Processing spec: ' + spec.name);
    let report;

    if (spec.format === 'md') {
      report = require('./md');
    } else if (spec.format === 'yaml') {
      report = require('./yaml');
    }

    report.write(data, spec);
  },
};
