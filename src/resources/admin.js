module.exports = function (module) {
    module
        .factory('Admin', ($q, AuthResource, $injector, $cacheFactory) => {
            'ngInject';
            let adminsCache = $cacheFactory('adminsCache');

            let resource = AuthResource('admin/:id', {}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: adminsCache
                },
                get: {
                    method: 'GET',
                    interceptor: {
                        response: function (response) {
                            let Team = $injector.get('Team');
                            return Team.query()
                                .$promise
                                .then(teams => {
                                    let id = response.resource.id;
                                    response.resource.teams = [];
                                    teams.forEach(t => {
                                        if (t.member_ids.includes(id)) {
                                            response.resource.teams.push(t);
                                        }
                                    });
                                    return response;
                                });
                        }
                    }
                },
                allAdmins: {
                    method: 'GET',
                    isArray: true,
                    cache: adminsCache
                },
                updateVisibleTags: {
                    method: 'POST',
                    url: 'admin/update_visible_tags'
                },
                updateVisibleSegments: {
                    method: 'POST',
                    url: 'admin/update_visible_segments'
                },
                updateUserColumns: {
                    method: 'POST',
                    url: 'admin/update_user_columns'
                },
                updateCompanyColumns: {
                    method: 'POST',
                    url: 'admin/update_company_columns'
                },
                initAdminSocket: {
                    method: 'POST',
                    url: 'admin/socket_init'
                }
            });

            let _allAdmins = resource.allAdmins;

            angular.extend(resource, {
                preparedAllAdmins: function () {
                    return _allAdmins().$promise.then((allAdmins) => {
                        allAdmins.forEach(prepareUser);
                        return allAdmins
                    });
                },
                prepareUser,
                clearCache: function () {
                    adminsCache.removeAll();
                }
            });


            return resource;
        });

    function prepareUser(user) {
        if (user.avatar == null) {
            user.avatar = {
                color: 'd76966',
                image_urls: {
                    square_25: 'https://static.intercomassets.com/avatars/314475/square_25/dd-1462432930-1462485091.jpg',
                    square_50: 'https://static.intercomassets.com/avatars/314475/square_25/dd-1462432930-1462485091.jpg',
                    square_128: 'https://static.intercomassets.com/avatars/314475/square_128/dd-1462432930-1462485091.jpg'
                },
                image_url: 'https://static.intercomassets.com/avatars/314475/square_128/dd-1462432930-1462485091.jpg'
            }
        }
        return user;
    }
};
