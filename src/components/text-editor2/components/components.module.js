const mod = module.exports = angular.module('riika.components.textEditor.components', [
    require('./custom-components/custom.module').name
]);

require('./editor/editor')(mod);
require('./insert-toolbar/insertToolbar')(mod);
require('./popover/popover')(mod);
require('./toolbar/toolbar')(mod);
require('./style-toolbar/styleToolbar')(mod);
