module.exports = function (module) {
    module
        .factory('Tags', (AuthResource, Admin, $cacheFactory, $q) => {
            'ngInject';

            function getDeps() {
                let promises = {
                    admins: Admin.query().$promise
                };

                return $q.all(promises);
            }

            function forModelPrepare(item, depts) {
                let {admins} = depts;
                item.created_by = _.find(admins, a => a.id === item.created_by_id);
            }

            function forModelInterceptor(action, key) {
                let keysToPrepare = ['query', 'get', 'save', 'update', 'forUser', 'forCompany', 'forMessage'];
                if (keysToPrepare.includes(key)) {
                    AuthResource.interceptAction(action, {
                        response: function (response) {
                            return getDeps()
                                .then(depts => {
                                    if(_.isArray(response)){
                                        response.forEach(item =>
                                            forModelPrepare(item, depts));
                                    } else {
                                        forModelPrepare(response, depts);
                                    }

                                    return response;
                                });
                        }
                    }, true);
                }
            }

            let tagsCache = $cacheFactory('tagsCache');
            let TagResource = AuthResource.decorate([forModelInterceptor], [], {
                clearCache: function () {
                    tagsCache.removeAll();
                }
            });

            return TagResource('tag/:id', {id: '@id'}, {
                query: {
                    method: 'GET',
                    params: {limit: 0},
                    isArray: true,
                    cache: tagsCache
                },
                update: {
                    method: 'PUT'
                },
                forUser: {
                    url: 'tag/used?model=User&id=:id',
                    method: 'GET',
                    isArray: true
                },
                forCompany: {
                    url: 'tag/used?model=Company&id=:id',
                    method: 'GET',
                    isArray: true
                },
                forMessage: {
                    url: 'tag/used?model=Message&id=:id',
                    method: 'GET',
                    isArray: true
                }
            });
        });
};
