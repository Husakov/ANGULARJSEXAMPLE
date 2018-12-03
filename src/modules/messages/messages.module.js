let req = require.context('./', true, /^(.*\.(scss$))[^.]*$/im);
req.keys().forEach(function (key) {
    req(key);
});

const mod = angular.module('riika.modules.messages', [
    require('./services/services.module').name,
    require('./components/components.module').name,
    require('./pages/pages.module').name,
    require('./dialogs/dialogs.module').name
]);

require('./messages.constants')(mod);
require('./messages.route')(mod);


module.exports = mod;
