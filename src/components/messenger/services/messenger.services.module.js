const mod = angular.module('intercom.components.messenger.services', []);

require('./messengerAudio')(mod);
require('./messageHelper')(mod);

module.exports = mod;