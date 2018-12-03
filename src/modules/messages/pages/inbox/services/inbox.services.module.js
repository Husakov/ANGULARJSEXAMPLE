const mod = angular.module('riika.modules.messages.pages.inbox.services', []);

require('./inboxesList')(mod);
require('./inboxHelper')(mod);

module.exports = mod;
