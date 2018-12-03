module.exports = function (module) {
    module
        .factory('Message', function (AuthResource, Admin, Team, Users, Profile, Tags, UploadResource, $q) {
            'ngInject';

            function getDeps(items) {
                return $q.all({
                    admins: Admin.query().$promise,
                    teams: Team.query().$promise,
                    currentUser: Profile.get().$promise,
                    users: Users.getByIds(_.compact(_.uniq(_.pluck(items, 'participant_id')))).$promise,
                    tags: Tags.query().$promise,
                    uploads: UploadResource.getByIds(_.uniq(_.flatten(_.pluck(items, 'upload_ids')))).$promise
                });
            }

            function prepare(message, {admins, teams, currentUser, users, tags, uploads}) {
                if (_.has(message, 'participant_id')) {
                    message.user = _.find(users, {id: message.participant_id});
                }
                if (_.has(message, 'admin_id')) {
                    message.admin = _.find(admins, {id: message.admin_id}) || currentUser;
                }
                if (_.has(message, 'assignee_id')) {
                    if (message.assignee_id === null) {
                        message.assignee = { name: 'Unassigned' };
                    } else {
                        message.assignee = _.find(admins, {id: message.assignee_id})
                            || _.find(teams, {id: message.assignee_id})
                            || currentUser;
                    }
                }

                message.tag_ids = message.tag_ids || [];
                message.tags = _.compact(message.tag_ids.map(id => _.find(tags, {id: id})));

                if (message.upload_ids) {
                    message.uploads = uploads.filter(item => message.upload_ids.includes(item.id) && !item.is_image);
                }
            }

            function prepareInterceptor(action, key) {
                let keysToPrepare = ['query', 'get', 'save', 'update'];
                if (keysToPrepare.includes(key)) {
                    AuthResource.interceptAction(action, {
                        response: function (response) {
                            let isArray = _.isArray(response),
                                resources = isArray ? response : [response];

                            return getDeps(resources)
                                .then((depts) => {
                                    resources.forEach(
                                        (item) => prepare(item, depts)
                                    );

                                    return response;
                                });
                        }
                    }, true);
                }
            }

            function prepareMessages(messages) {
                return getDeps(messages)
                    .then((depts) => {
                        messages.forEach(
                            (item) => prepare(item, depts)
                        );
                        return messages;
                    });
            }

            let MessageResource = AuthResource.decorate([prepareInterceptor], [], {prepareMessages});

            return MessageResource('message/:id', {id: '@id'}, {
                updateTags: {
                    method: 'PUT',
                    url: 'message/:id/tag_ids'
                }
            });
        });
};
