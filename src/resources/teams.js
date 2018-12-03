module.exports = function (module) {
    module
        .factory('Team', ($q, AuthResource, $cacheFactory, Admin) => {
            'ngInject';

            let teamsCache = $cacheFactory('teamsCache');

            function clearCacheInterceptor(resp) {
                resource.clearCache();
                return resp.resource;
            }

            function prepareTeams(teams) {
                return Admin.query().$promise
                    .then((admins) => {
                        _.each(teams, (item) => {
                            item.member_ids = item.member_ids || [];
                            item.members = _.compact(_.map(item.member_ids, id => _.find(admins, {id: id})));
                        });

                        return teams;
                    });
            }

            let resource = AuthResource('team/:id', {id: '@id'}, {
                allTeams: {
                    method: 'GET',
                    isArray: true,
                    cache: teamsCache,
                    interceptor: {
                        response: function (resp) {
                            return prepareTeams(resp.resource);
                        }
                    }
                },
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: teamsCache,
                    interceptor: {
                        response: function (resp) {
                            return prepareTeams(resp.resource);
                        }
                    }
                },
                get: {
                    method: 'GET',
                    cache: teamsCache,
                    interceptor: {
                        response: function (resp) {
                            return prepareTeams([resp.resource])
                                .then(teams => teams[0]);
                        }
                    }
                },
                save: {
                    method: 'POST',
                    interceptor: {
                        response: clearCacheInterceptor
                    }
                },
                update: {
                    method: 'PUT',
                    interceptor: {
                        response: clearCacheInterceptor
                    }
                },
                delete: {
                    method: 'DELETE',
                    interceptor: {
                        response: clearCacheInterceptor
                    }
                },
                addMember: {
                    method: 'PUT',
                    url: 'team/:id/add_member'
                },
                removeMember: {
                    method: 'PUT',
                    url: 'team/:id/remove_member'
                }
            });

            angular.extend(resource, {
                clearCache: function () {
                    teamsCache.removeAll();
                }
            });

            return resource;
        });
};