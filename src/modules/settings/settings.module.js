require('./general-settings.scss');

const mod = angular.module('riika.module.settings', [
    require('./services/services.module').name
]);

require('./settings.route')(mod);
require('./nav/settingsNav')(mod);

module.exports = mod;
