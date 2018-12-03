const mod = angular.module('riika.modules.contacts.pages.list.components', []);

require('./listSegmentsDropdown/listSegmentsDropdown')(mod);
require('./listToolbar/listToolbar')(mod);
require('./listTableHeaders/listTableHeaders')(mod);
require('./listTableBody/listTableBody')(mod);
require('./listActions/listActions')(mod);

module.exports = mod;
