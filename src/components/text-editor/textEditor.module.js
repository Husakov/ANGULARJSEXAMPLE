const mod = module.exports = angular.module('intercom.components.textEditor', [
    require('./services/textEditor.services.module').name,
    require('./components/textEditor.components.module').name,
    require('./directives/textEditor.directives.module').name
]);

require('./toolbar-elements/textEditor.toolbarElements')(mod);
