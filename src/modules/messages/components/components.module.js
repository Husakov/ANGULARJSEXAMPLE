const mod = angular.module('riika.modules.messages.components', []);

require('./side-nav/side-nav')(mod);
require('./preview/preview')(mod);

module.exports = mod;
