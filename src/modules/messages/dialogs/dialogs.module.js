const mod = angular.module('riika.modules.messages.dialogs', []);

require('./sendTestEmail/sendTestEmail')(mod);

module.exports = mod;
