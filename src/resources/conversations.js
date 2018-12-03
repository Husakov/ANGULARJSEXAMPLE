module.exports = function (module) {
    module
        .factory('Conversations', ($q, AuthResource, Admin, Team, Users, Profile) => {
            'ngInject';

            function getDeps(items) {
                return $q.all({
                    admins: Admin.allAdmins().$promise,
                    teams: Team.query().$promise,
                    currentUser: Profile.get().$promise,
                    users: Users.getByIds(_(items).pluck('participants').flatten().uniq().value()).$promise
                });
            }

            function prepare(conversation, {admins, teams, currentUser, users}) {
                conversation._assignee =
                    _.find(admins, {id: conversation.assignee_id})
                    || _.find(teams, {id: conversation.assignee_id})
                    || currentUser;

                conversation._participants = users.filter(user => conversation.participants.includes(user.id));
                conversation._mainParticipant = _.first(conversation._participants);

                setLastMessage(conversation);
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

            function setLastMessage(conversation, message) {
                if (!conversation._lastMessage) {
                    conversation._lastMessage = {};
                }
                if (message && message.sub_type === 'comment') {
                    if (!conversation.conversation_parts) {
                        conversation.conversation_parts = [];
                    }
                    conversation.conversation_parts.unshift(message);
                }
                if (conversation.conversation_parts && conversation.conversation_parts.length > 0) {
                    let last_message = conversation.conversation_parts[0];
                    let last_message_participant_id = last_message.participant_id;
                    conversation._lastMessage = last_message;
                    conversation._lastMessage.user = _.find(conversation._participants, {id: last_message_participant_id});
                }
            }

            let ConversationResource = AuthResource.decorate([prepareInterceptor], [], {setLastMessage});

            return ConversationResource('conversation/:id', {id: '@id'}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    params: {
                        include_count: true
                    }
                },
                readByAdmin: {
                    method: 'PUT',
                    url: 'conversation/:id/read_by_admin'
                }
            });
        });
};