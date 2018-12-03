require('angular');
require('angular-resource');
require('angular-sanitize');
require('angular-ui-router');
require('angular-animate');
require('angular-permission');
require('angular-ui-notification');

require('./signup.scss');

const dependencies = [
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ngAnimate',
    'permission',
    'permission.ui',
    require('angular-cookies'),
    require('angular-ui-bootstrap'),
    require('angular-ui-notification'),

    require('../resources/base/resources.base.module').name,
    require('../services/services.module').name
];

if (PROD) {
    require('../gtm')(dependencies);
}

const mod = angular.module('riika.signup', dependencies);

mod
    .component('login', require('./login/login'));

require('../directives/ri-scrollbar/ri-scrollbar')(mod);
require('../directives/input-container/input-container')(mod);
require('./signup.routes')(mod);
require('./signup.run')(mod);
require('./signup.configs')(mod);
