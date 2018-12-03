const mod = angular.module('intercom.components.scrollList', []);

require('./scrollListHelper')(mod);
require('./scrollList')(mod);

module.exports = mod;