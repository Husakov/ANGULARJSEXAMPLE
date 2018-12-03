module.exports = function (mod) {

    let testTemplateUrl,
        bootstrapTemplateUrl,
        testCtrl;
    if (!STAGE_OR_PROD) {
        testTemplateUrl = require('./mocks/test.html');
        testCtrl = require('./mocks/testController');
        bootstrapTemplateUrl = require('./mocks/bootstrap.html');
    }

    mod.config(function ($stateProvider, $urlRouterProvider) {
        'ngInject';
        $urlRouterProvider.otherwise(function ($injector) {
            let $state = $injector.get('$state');
            $state.go('messages.inbox');
        });

        $stateProvider
            .state('login', {
                onEnter: function (auth) {
                    'ngInject';
                    const lastRoute = _.last(auth.getDeniedRoutes());
                    let href = window.location.origin + '/signup';
                    if (lastRoute) {
                        href += '?target=' + encodeURIComponent(lastRoute.href);
                    }
                    window.location = href;
                }
            })
            .state('home', {
                data: {
                    permissions: {
                        only: 'isAuthorized',
                        redirectTo: 'login'
                    }
                },
                url: '/'
            });

        if (!STAGE_OR_PROD) {
            $stateProvider
                .state('test', {
                    url: '/test',
                    templateUrl: testTemplateUrl,
                    controller: testCtrl,
                    controllerAs: '$ctrl'
                })
                .state('bootstrap', {
                    url: '/bootstrap',
                    templateUrl: bootstrapTemplateUrl,
                    controller: require('./mocks/bootstrapController'),
                    controllerAs: '$ctrl'
                });

        }

        $urlRouterProvider.deferIntercept();
    });
};
