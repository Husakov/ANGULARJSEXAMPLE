const mod = angular.module('riika.modules.import.services', []);

require('./importTypes/csvImport')(mod);
require('./importTypesHelper')(mod);
require('./stateManager')(mod);

module.exports = mod;
