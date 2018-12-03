let templateUrl = require('./index.html');
require('./loader.scss');

module.exports = angular.module('intercom.components.loader', [])
    .component('loader', {
        templateUrl: templateUrl
    });
