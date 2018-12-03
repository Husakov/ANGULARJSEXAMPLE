const mod = angular.module('riika.modules.messages.pages', [
    require('./list/components/components.module').name,
    require('./list/dialogs/dialogs.module').name,
    require('./edit/services/services.module').name,
    require('./edit/components/components.module').name,
    require('./details/services/services.module').name,
    require('./inbox/services/inbox.services.module').name,
    require('./inbox/components/inbox.components.module').name
]);

require('./list/listController')(mod);
require('./edit/editController')(mod);
require('./edit/editSidebarController')(mod);
require('./details/detailsController')(mod);
require('./details/detailsSidebarController')(mod);
require('./details/reports/reportsController')(mod);
require('./inbox/inboxCtrl')(mod);

module.exports = mod;
