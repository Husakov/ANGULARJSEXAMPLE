require('jquery');
require('lodash');
require('angular');
require('angular-resource');
require('angular-sanitize');
require('angular-animate');
require('angular-ui-router');
require('angular-permission');
require('ui-select');
require('angular-color-picker');
require('angular-local-storage');
require('angular-file-upload');
require('moment-timezone');
require('angular-moment');
require('leaflet');
require('angular-filter');
require('angular-drag-and-drop-lists');

require('./assets/styles/app.scss');

const dependencies = [
    'ngResource',
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'permission',
    'permission.ui',
    'angular.filter',
    require('angular-cookies'),

    require('angular-ui-bootstrap'),
    require('ng-infinite-scroll'),
    'ui.select',
    'mp.colorPicker',
    'dndLists',

    'angularMoment',
    'LocalStorageModule',
    'angularFileUpload',
    require('angular-ui-notification'),

    require('mnh-shared/dist/index.angular'),

    require('./filters/filters.module').name,
    require('./directives/directives.module').name,
    require('./components/components.module').name,

    require('./resources/base/resources.base.module').name,
    require('./resources/resources.module').name,
    require('./services/services.module').name,

    require('./dialogs/dialogs.module').name,

    require('./modules/modules').name
];

if (!STAGE_OR_PROD) {
    dependencies.push(...[
        require('./mocks/backendRequestsMock').name
    ]);
}

if (PROD && GTM_ID) {
    require('./gtm')(dependencies);
}

if (PROD && ROLLBAR_ID) {
    dependencies
        .push(require('ng-rollbar'));
}

const mod = angular.module('riika', dependencies);

require('./app.constants')(mod);
require('./routes')(mod);
require('./app.configs')(mod);
require('./app.run')(mod);

if (PROD && ROLLBAR_ID) {
    require('./rollbar')(mod);
}

window.VERSION = {
    STAGE_OR_PROD,
    STAGE,
    PROD,
    ENV,
    BUILD_NUMBER
};
