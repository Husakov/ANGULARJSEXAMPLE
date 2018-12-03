const mod = angular.module('riika.modules.messages.pages.inbox.components', []);

require('./sidePanel/sidePanel')(mod);
require('./sidePanel/sideElement/sideElement')(mod);
require('./profilePanel/profilePanel')(mod);

module.exports = mod;
