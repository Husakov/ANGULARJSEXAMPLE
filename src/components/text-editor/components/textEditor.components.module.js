const mod = module.exports = angular.module('intercom.components.textEditor.components', []);

require('./editor/editor')(mod);
require('./styleToolbar/toolbar')(mod);
require('./insertToolbar/toolbar')(mod);
require('./attachments/attachments')(mod);
require('./mentions/mentions')(mod);
require('./popover/popover')(mod);
