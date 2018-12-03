module.exports = function (module) {

    module.config(function ($compileProvider, $animateProvider) {
        'ngInject';

        $compileProvider.debugInfoEnabled(!STAGE_OR_PROD);

        $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);

    });

    angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);
};
