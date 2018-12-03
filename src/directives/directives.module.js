const mod = angular.module('riika.directives', []);

require('./editable/editable')(mod);
require('./ri-scrollbar/ri-scrollbar')(mod);
require('./fixed-header/fixed-header')(mod);
require('./click-outside')(mod);
require('./match')(mod);
require('./model-formatter')(mod);
require('./no-click-through')(mod);
require('./on-enter')(mod);
require('./overlay')(mod);
require('./recompile')(mod);
require('./scroll-fix')(mod);
require('./input-container/input-container')(mod);
require('./keys-navigation')(mod);

module.exports = mod;
