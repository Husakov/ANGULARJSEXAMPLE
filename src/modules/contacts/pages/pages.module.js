const mod = angular.module('riika.modules.contacts.pages', [
    require('./details/components/components.module').name,
    require('./list/components/components.module').name
]);

require('./list/listController')(mod);
require('./details/detailsController')(mod);

module.exports = mod;