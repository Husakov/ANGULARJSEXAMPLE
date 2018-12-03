const mod = module.exports = angular.module('intercom.components.usersFilter.components', []);

require('./filter/users-filter')(mod);
require('./search/search')(mod);
require('./predicate/predicate')(mod);
