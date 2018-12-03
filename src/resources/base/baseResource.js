module.exports = function (module) {
    module
        .factory('BaseResource', function (UtilResource, $http, CONFIG, $q, $log) {
            'ngInject';

            function setBaseUrl(url) {
                return CONFIG.apiUrl + '/' + url;
            }

            function baseURLParamsDecorator(params) {
                params[0] = setBaseUrl(params[0]);
                return params;
            }

            function baseURLDecorator(action) {
                if (_.has(action, 'url')) {
                    action.url = setBaseUrl(action.url);
                }
            }

            function defaultResponseInterceptorDecorator(action) {
                UtilResource.interceptAction(action, {
                    response: function (response) {
                        return response.resource || response;
                    }
                }, true)
            }

            function warningHeaderInterceptorDecorator(action) {
                UtilResource.interceptAction(action, {
                    response: function (response) {
                        if (response.headers('Warning')) {
                            $log.warn('Warning from "' + response.config.url + '" : ' + response.headers('Warning'));
                        }
                        return response;
                    }
                });
            }

            function countHeaderInterceptorDecorator(action) {
                UtilResource.interceptAction(action, {
                    response: function (response) {
                        if (response.headers('X-Pagination-Count')) {
                            response.resource.total_count = parseInt(response.headers('X-Pagination-Count'), 10);
                        }
                        return response;
                    }
                });
            }

            function defaultTransformDecorator(action) {
                UtilResource.transformAction(action, {
                    response: $http.defaults.transformResponse,
                    request: $http.defaults.transformRequest
                })
            }

            const getByIds = (function () {
                const getterKey = Symbol();
                class Getter {
                    constructor() {
                        this.query = [];
                        this.defers = [];
                        this.go = _.debounce(this.go.bind(this), 500);
                    }

                    add(ids, defer) {
                        this.query.push(...ids);
                        this.query = _(this.query).compact().uniq().value();
                        this.defers.push(defer);
                        this.go();
                    }

                    go() {
                        let ids = angular.toJson({id: this.query});
                        this.resource.query({where: ids}).$promise
                            .then(items => {
                                this.defers.forEach(defer => defer.resolve(items));
                            });
                        this.resource[getterKey] = null;
                    }

                    static add(ids, resource) {
                        let def = $q.defer();

                        if (!resource[getterKey]) {
                            resource[getterKey] = new Getter();
                            resource[getterKey].resource = resource;
                        }

                        resource[getterKey].add(ids, def);

                        return def.promise
                            .then(items => items.filter(item => ids.includes(item.id)));
                    }
                }

                return function getByIds(ids = []) {
                    let result = [];
                    if (ids.length > 0) {
                        result.$promise = Getter.add(ids, this)
                            .then(items => {
                                result.push(...items);
                                result.$resolved = true;
                                return result;
                            })
                    } else {
                        result.$promise = $q.resolve(result);
                    }
                    result.$resolved = false;
                    return result;
                }
            })();


            return UtilResource.decorate(
                [
                    baseURLDecorator,
                    defaultResponseInterceptorDecorator,
                    defaultTransformDecorator,
                    warningHeaderInterceptorDecorator,
                    countHeaderInterceptorDecorator
                ],
                [
                    baseURLParamsDecorator
                ],
                {
                    getByIds: getByIds
                }
            );
        });
};
