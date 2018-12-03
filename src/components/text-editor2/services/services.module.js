const mod = module.exports = angular.module('riika.components.textEditor.services', []);

require('./actions')(mod);
require('./editor-model-binder')(mod);
require('./htmlFixer')(mod);
require('./Injector')(mod);
require('./Parser')(mod);
require('./selectionHelper')(mod);
require('./State')(mod);
