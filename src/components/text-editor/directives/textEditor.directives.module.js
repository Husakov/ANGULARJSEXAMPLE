const mod = module.exports = angular.module('intercom.components.textEditor.directives', []);

require('./actionInvoker')(mod);
require('./attributeFixer')(mod);
require('./mentionFixer')(mod);
require('./newLineFixer')(mod);
require('./videoThumbFixer')(mod);
require('./listsAutocomplete')(mod);
