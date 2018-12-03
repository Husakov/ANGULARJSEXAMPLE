module.exports = angular.module('intercom.components.messenger', [
    require('./services/messenger.services.module').name,
    require('./components/messanger.components.module').name
])
    .component('messenger', require('./messenger'));
