module.exports = function (module) {
    module
        .factory('AuthResource', function (BaseResource, auth, app, $q) {
            'ngInject';

            function tokenHeaderDecorator(action) {
                action.headers = angular.merge({}, {
                    'X-Token': () => auth.getToken(),
                    'X-App': () => app.getAppId()
                }, action.headers);
            }

            function unauthorizedErrorDecorator(action) {
                BaseResource.interceptAction(action, {
                    responseError: function (rejection) {
                        if (rejection.status === 401) {
                            auth.logout();
                        }
                        return $q.reject(rejection);
                    }
                });
            }

            return BaseResource.decorate([tokenHeaderDecorator, unauthorizedErrorDecorator]);
        });
};