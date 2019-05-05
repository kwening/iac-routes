'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const filter = require('./filter');

module.exports = {
  write: function(data, spec) {
    toYaml(data, spec);
  },
};

function toYaml(allRoutes, spec) {
  const filtered = filter.apply(allRoutes, spec.filter);

  console.log('Writing report to file: ' + spec.output);
  fs.writeFileSync(spec.output, yaml.safeDump(filtered, {
    skipInvalid: true,
    sortKeys: true,
    noRefs: true}));
}
