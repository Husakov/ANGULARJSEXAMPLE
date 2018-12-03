const mod = angular.module('intercom.components.usersFilter.services', []);

require('./comparison.constant')(mod);
require('./ComparisonHelper')(mod);

module.exports = mod;
