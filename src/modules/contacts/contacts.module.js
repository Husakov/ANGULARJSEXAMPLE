let req = require.context('./', true, /^(.*\.(scss$))[^.]*$/im);
req.keys().forEach(function(key){
    req(key);
});

const mod = angular.module('riika.modules.contacts', [
    require('./services/services.module').name,
    require('./pages/pages.module').name
]);

require('./contacts.route')(mod);


module.exports = mod;
