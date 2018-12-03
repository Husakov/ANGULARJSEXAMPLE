const mod = module.exports = angular.module('riika.resources.base', []);

require('./utilResource')(mod);
require('./baseResource')(mod);
require('./authResource')(mod);
