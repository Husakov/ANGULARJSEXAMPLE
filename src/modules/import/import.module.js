let req = require.context('./', true, /^(.*\.(scss$))[^.]*$/im);
req.keys().forEach(function (key) {
    req(key);
});

const mod = angular.module('riika.modules.import', [
    require('./components/components.module').name,
    require('./pages/page.module').name,
    require('./services/services.module').name
]);

require('./import.route')(mod);

module.exports = mod;
