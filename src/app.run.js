module.exports = function (mod) {
    mod.run(function run($rootScope, $state, $timeout, permissions, $urlRouter, moment, $q, $injector, app, $window, detectPlatform, $location) {
        'ngInclude';

        moment.locale('en', {
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: '1m',
                m: '%dm',
                mm: '%dm',
                h: '1h',
                hh: '%dh',
                d: '1d',
                dd: '%dd',
                M: '%dmo',
                MM: '%dmo',
                y: '1y',
                yy: '%d y'
            }
        });

        detectPlatform.init();
        $rootScope.bodyClass = detectPlatform.platformClass;

        function reload() {
            $state.reload();
        }

        function redirect(to, params, options = {}) {
            $timeout(() => {
                if (options.location === 'replace') {
                    $location.replace();
                }
                $state.go.apply($state, arguments);
            });
        }

        function redirectTo(to, params) {
            let redirectTo = to.redirectTo;

            if (angular.isFunction(redirectTo) || angular.isArray(redirectTo)) {
                redirectTo = $injector.invoke(redirectTo, null, {to: to, params: params});
            }

            $q.when(redirectTo)
                .then(redirectTo => {
                    if (angular.isString(redirectTo)) {
                        redirect(redirectTo, params, {location: 'replace'})
                    } else {
                        params = angular.merge({}, params, redirectTo[1]);
                        let options = angular.merge({location: 'replace'}, redirectTo[2]);
                        redirect(redirectTo[0], params, options);
                    }
                });
        }

        $rootScope.$on('login', () => reload());
        $rootScope.$on('logout', () => redirect('login'));
        $rootScope.$on('reload', () => {
            $window.location.reload();
        });

        $rootScope.$on('$stateChangePermissionAccepted', function (evt, to, params) {
            if (to.redirectTo) {
                evt.preventDefault();
                redirectTo(to, params);
            }
        });

        $rootScope.back = function () {
            $window.history.back();
        };

        $rootScope.PROD = PROD;
        $rootScope.STAGE = STAGE;
        $rootScope.STAGE_OR_PROD = STAGE_OR_PROD;

        $q
            .all([
                app.init()
            ])
            .then(() => {
                permissions.initUserPermissions();

                $urlRouter.sync();
                $urlRouter.listen();
            });

    });
};
