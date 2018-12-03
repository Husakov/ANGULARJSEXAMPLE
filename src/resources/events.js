module.exports = function (module) {
    module
        .factory('Events', (AuthResource, $q, Admin, Users) => {
            'ngInject';

            let admins = Admin.query();

            function getDeps(items) {
                let user_ids = _.uniq(_.flatten(_.pluck(items, 'user_id')));

                let promises = {
                    admins: admins.$promise,
                    users: Users.getByIds(user_ids).$promise
                };

                return $q.all(promises);
            }

            function prepare(event, values) {
                let {admins, users} = values;

                if (event.author_id) {
                    event.author = _.find(admins, {id: event.author_id});
                }

                if (event.user_id) {
                    event.user = _.find(users, {id: event.user_id});
                }

                if (event.mentioned_admins) {
                    event.mentioned_admins_profile = [];
                    event.mentioned_admins_profile =  event.mentioned_admins
                        .map(id => _.find(admins, {id}))
                        .filter(admin => !!admin);
                }
            }

            function prepareInterceptor(action, key) {
                let keysToPrepare = ['query'];
                if (keysToPrepare.includes(key)) {
                    AuthResource.interceptAction(action, {
                        response: function (response) {
                            let isArray = _.isArray(response),
                                resources = isArray ? response : [response];

                            return getDeps(resources)
                                .then((depts) => {
                                    resources.forEach(
                                        (event) => prepare(event, depts)
                                    );
                                    return response;
                                });
                        }
                    }, true);
                }
            }

            let EventResource = AuthResource.decorate([prepareInterceptor]);

            return EventResource('event/:id', {id: '@id'}, {
                query: {
                    method: 'GET',
                    url: 'event?:query',
                    params: {query: '@query'},
                    isArray: true
                }
            });
        });
};
