const mod = angular.module('intercom.components.usersFilter', [
    require('./components/users-filter.components.module').name,
    require('./services/user-filter.services.module').name
]);

module.exports = mod;
