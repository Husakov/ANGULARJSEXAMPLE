const mod = angular.module('riika.modules.messages.services', []);

require('./actions')(mod);
require('./MessageModel')(mod);
require('./ReportsHelper')(mod);
require('./rules')(mod);
require('./mediator')(mod);
require('./rulesDataHelper')(mod);
require('./sectionsHelper')(mod);

module.exports = mod;
