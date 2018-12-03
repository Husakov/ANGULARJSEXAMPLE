const mod = angular.module('riika.modules.import.components', []);

require('./import-selector/import-selector')(mod);
require('./steps-manager/steps-manager.module')(mod);
require('./steps/steps.module')(mod);

module.exports = mod;
