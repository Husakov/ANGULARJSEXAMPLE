module.exports = function (module) {
    module
        .factory('contactsDetailsHelper', function ($cacheFactory, $state, $timeout, Companies, Admin, Users) {
            'ngInject';

            let companiesCache = $cacheFactory('companiesResourceCache');
            let adminsCache = $cacheFactory('adminsResourceCache');
            let usersCache = $cacheFactory('usersResourceCache');

            function getContactData(mode) {
                switch (mode) {
                    case 'companies':
                        return {
                            resource: Companies,
                            cache: companiesCache
                        };
                    case 'admins':
                        return {
                            resource: Admin,
                            cache: adminsCache
                        };
                    case 'users':
                        return {
                            resource: Users,
                            cache: usersCache
                        };
                    default:
                        break;
                }
            }

            class contactsDetailsHelper {
                getContactData(mode) {
                    let {resource, cache} = getContactData(mode);

                    if (!cache.get($state.params.id)) {
                        let data = resource.get({id: $state.params.id});
                        cache.put($state.params.id, data);
                        $timeout(() => {
                            cache.remove($state.params.id);
                        }, 100);
                        return data;
                    } else {
                        return cache.get($state.params.id);
                    }
                }

                deleteContact(mode, id) {
                    let {resource} = getContactData(mode);
                    return resource
                        .bulkDelete({}, {included_ids: [id]})
                        .$promise;
                }
            }

            return new contactsDetailsHelper();
        });
};
