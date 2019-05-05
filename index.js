'use strict';

const routes = require('./src/routes');
const reports = require('./src/report');
const fs = require('fs');
const yaml = require('js-yaml');

let program = require('commander');

program
  .version('0.1.0')
  .option('-s, --spec <specFile>', 'path to spec file')
  .parse(process.argv);

if (program.spec === undefined) {
  console.log('argument --spec missing');
  return;
}

let specYaml = yaml.safeLoad(fs.readFileSync(program.spec, 'utf8'));
let allRoutes = routes.getAll(specYaml.dataFolder);

specYaml.reports.forEach(report => {
  reports.processData(allRoutes, report);
});
