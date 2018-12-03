const mod = module.exports = angular.module('intercom.components.textEditor.services', []);

require('./attachments')(mod);
require('./elementsHelper')(mod);
require('./injector')(mod);
require('./manager')(mod);
require('./Parser')(mod);
require('./selectionHelper')(mod);
