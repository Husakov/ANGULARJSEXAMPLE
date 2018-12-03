const mod = angular.module('riika.components.ri-draggable', []);
require('./draggable.scss');

require('./draggable')(mod);
require('./draggable-pointer')(mod);

module.exports = mod;
