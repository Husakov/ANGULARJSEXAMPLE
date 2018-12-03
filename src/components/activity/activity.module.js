const mod = angular.module('riika.components.activity', [
    require('./services/activity.services.module').name,
    require('./components/activity.components.module').name
]);

require('./activity')(mod);

module.exports = mod;
