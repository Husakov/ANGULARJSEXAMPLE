const mod = angular.module('riika.modules.messages.pages.list.components', []);

require('./listSectionsDropdown/listSectionsDropdown')(mod);
require('./listToolbar/listToolbar')(mod);

module.exports = mod;
