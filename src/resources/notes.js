module.exports = function (module) {
    module
        .factory('Notes', ($q, AuthResource, Admin) => {
            'ngInject';

            let resource = AuthResource('note', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                },
                create: {
                    method: 'POST',
                    url: 'note'
                }
            });

            angular.extend(resource, {
                preparedQuery: function (params) {
                    let result = resource.query(params);

                    result.$promise = $q.all([result.$promise, Admin.preparedAllAdmins()])
                        .then((promises) => {
                            let [notes, allAdmins] = promises;
                            notes.forEach((note) => {
                                if (note.created_by != null) {
                                    note.created_by_object = _.find(allAdmins, {id: note.created_by})
                                }
                            });
                            return notes;
                        });

                    return result;
                }
            });

            return resource;
        });
};