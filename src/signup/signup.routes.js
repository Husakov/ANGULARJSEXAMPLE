module.exports = function (mod) {

    function getParams(query) {
        if (!query) {
            return {};
        }
        return (/^[?#]/.test(query) ? query.slice(1) : query)
            .split('&')
            .reduce((params, param) => {
                let [key, value] = param.split('=');
                params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                return params;
            }, {});
    }

    mod.config(
        function routerConfig($stateProvider, $urlRouterProvider) {
            'ngInject';

            $urlRouterProvider.otherwise(function ($injector) {
                let $state = $injector.get('$state');
                $state.go('signup.login');
            });

            $stateProvider
                .state('main', {
                    onEnter: function () {
                        const target = getParams(location.search).target;
                        let href = window.location.origin + '/';

                        if (target) {
                            href += target
                        }
                        window.location = href;
                    }
                })
                .state('signup', {
                    data: {
                        permissions: {
                            except: 'isAuthorized',
                            redirectTo: 'main'
                        }
                    },
                    template: '<div class="h-100" ui-view></div>'
                })
                .state('signup.login', {
                    url: '/',
                    template: '<login class="login-wrapper"></login>'
                });

            $urlRouterProvider.deferIntercept();
        });
};
