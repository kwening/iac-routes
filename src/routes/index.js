'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const merge = require('deepmerge');
const extend = require('extend');

module.exports = {
  getAll: function(folder) {
    console.log('Reading yaml files from folder: ' + folder);
    let yamlData = readYamlFiles(folder, 'utf8');
    resolveComponents(yamlData);
    resolveRoutes(yamlData);
    return yamlData.allRoutes;
  },
};

function readYamlFiles(folder, encoding) {
  let yamlData = {};

  // read all yaml files in srcFolder
  fs.readdirSync(folder).forEach(file => {
    try {
      let doc = yaml.safeLoad(fs.readFileSync(folder + file, encoding));
      yamlData = merge(yamlData, doc);
    } catch (e) {
      console.log(e);
    }
  });

  return yamlData;
}

function resolveComponents(yamlData) {
  // first run - set groups and initial values (id,...)
  yamlData.components.forEach(comp => {
    if (comp.id === undefined) {
      comp.id = comp.name;
    }

    if (comp.type === 'group') {
      comp.items.forEach(c => {
        let item = yamlData.components.find(obj => {
          return obj.id === c;
        });

        if (item === undefined) {
          return;
        }

        (item.groups = item.groups || []).push(comp.id);
      });

    }
  });

  // second run - apply group values to components
  yamlData.components.forEach(comp => {
    if (comp.type === 'group' || comp.groups === undefined) {
      return;
    }

    comp.groups.forEach(g => {
      let group = yamlData.components.find(obj => {
        return obj.id === g;
      });

      if (group.tags !== undefined) {
        comp.tags = merge(comp.tags, group.tags);
      }
    });
  });
}

function resolveRoutes(yamlData) {
  yamlData.allRoutes = [];

  // create route objects and flatten list
  yamlData.routes.forEach(route => {
    if (route.items !== undefined) {
      route.items.forEach(r => {
        expandGroups(yamlData, getRouteObject(r, route.src, route.dest), yamlData.components);
      });
    } else {
      expandGroups(yamlData, getRouteObject(route, undefined, undefined), yamlData.components);
    }
  });

  // set all properties to rules
  yamlData.allRoutes.forEach(route => {
    if (route.tags === undefined){
      route.tags = [];
    }

    route.direction = '';

    let srcComp = yamlData.components.find(obj => {
      return obj.id === route.src;
    });

    if (srcComp !== undefined) {
      route.srcIP === undefined ? route.srcIP = srcComp.ip : '';
      route.srcHost === undefined ? route.srcHost = srcComp.name : '';
      route.tags = merge(route.tags, srcComp.tags);
      route.direction = 'OUT';
    }

    let destComp = yamlData.components.find(obj => {
      return obj.id === route.dest;
    });

    if (destComp !== undefined) {
      route.destIP === undefined ? route.destIP = destComp.ip : '';
      route.destHost === undefined ? route.destHost = destComp.name : '';
      route.tags = merge(route.tags, destComp.tags);
      route.direction = 'IN' + route.direction;
    }
  });
}

function getRouteObject(route, src, dest) {
  let newRoute = {src: src, dest: dest};

  if (typeof route === 'string') {
    let splitted = route.split(' : ');

    if (src === undefined && dest === undefined) {
      newRoute.src = splitted[0];
      newRoute.dest = splitted[1];
      newRoute.ports = splitted[2];
      newRoute.meta = splitted[3];
    } else if (src === undefined) {
      newRoute.src = splitted[0];
      newRoute.ports = splitted[1];
      newRoute.meta = splitted[2];
    } else if (dest === undefined) {
      newRoute.dest = splitted[0];
      newRoute.ports = splitted[1];
      newRoute.meta = splitted[2];
    }
  } else {
    extend(newRoute, route, newRoute);
  }

  if (typeof newRoute.meta === 'string') {
    newRoute.meta = newRoute.meta.replace(/'/g, '"');
    newRoute.meta = JSON.parse(newRoute.meta);
  }

  return newRoute;
}

function expandGroups(yamlData, route) {
  let srcRoutes = [];

  let srcComp = yamlData.components.find(obj => {
    return obj.id === route.src;
  });

  let destComp = yamlData.components.find(obj => {
    return obj.id === route.dest;
  });

  if (srcComp !== undefined && srcComp.items !== undefined) {
    srcComp.items.forEach(c => {
      let srcComp2 = yamlData.components.find(obj => {
        return obj.id === c;
      });

      let newRoute = {...route};
      newRoute.src = srcComp2.id;
      newRoute.srcGroup = srcComp.id;
      srcRoutes.push(newRoute);
    });
  } else {
    srcRoutes.push(route);
  }

  srcRoutes.forEach(srcRoute => {
    if (destComp !== undefined && destComp.items !== undefined) {
      destComp.items.forEach(c => {
        let destComp2 = yamlData.components.find(obj => {
          return obj.id === c;
        });

        let newRoute = {...srcRoute};
        newRoute.dest = destComp2.id;
        newRoute.destGroup = destComp.id;
        yamlData.allRoutes.push(newRoute);
      });
    } else {
      yamlData.allRoutes.push(srcRoute);
    }
  });
}
