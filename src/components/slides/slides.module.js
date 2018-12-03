const mod = angular.module('intercom.components.slides', []);

require('./slides.scss');

require('./slides')(mod);
require('./slide')(mod);

module.exports = mod;
