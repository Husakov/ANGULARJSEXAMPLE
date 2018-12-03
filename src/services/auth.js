module.exports = function (module) {
    module
        .factory('auth', function (BaseResource, $q, $cookies, pubSub, $state) {
            'ngInject';

            const authOA = 'ae9d26b0ed3512ebf4a502d4fe23c077cd83ca4e';

            class TokenStorage {
                constructor() {
                    this.token = this._get();
                }

                _get() {
                    let str = $cookies.get('x-token');
                    try {
                        str = atob(str);
                        str = str.substring(authOA.length, str.length - authOA.length);
                    } catch (e) {
                        return null;
                    }
                    return str;
                }

                set(token) {
                    let str = authOA + token + authOA,
                        expirationDate = new Date(),
                        expires = 7;
                    expirationDate.setDate(expirationDate.getDate() + expires);
                    str = btoa(str);
                    $cookies.put('x-token', str, {path: '/', expires: expirationDate});
                    this.token = token;
                }

                delete() {
                    $cookies.remove('x-token');
                    this.token = null;
                }

                isValid() {
                    return _.isString(this.token);
                }
            }

            const tokenStorage = new TokenStorage(),
                resource = BaseResource('', {}, {
                    login: {
                        url: 'login',
                        method: 'POST'
                    }
                });


            const deniedRoutes = [];

            pubSub.on('$stateChangePermissionDenied', function (event, toState, toParams) {
                deniedRoutes.push({
                    state: toState,
                    params: toParams,
                    href: $state.href(toState, toParams)
                });
            });

            return {
                getToken: function () {
                    return tokenStorage.token;
                },
                isAuthorized: function () {
                    return tokenStorage.isValid();
                },
                login: function (params) {
                    let def = $q.defer();

                    resource.login(params)
                        .$promise
                        .then((data) => {
                            tokenStorage.set(data.access_token);
                            def.resolve();
                            pubSub.emit('login');
                        })
                        .catch((err) => {
                            def.reject(err.data);
                        });

                    return def.promise;
                },
                logout: function () {
                    tokenStorage.delete();
                    pubSub.emit('logout');
                },
                getDeniedRoutes() {
                    return deniedRoutes;
                }
            };
        });
};
