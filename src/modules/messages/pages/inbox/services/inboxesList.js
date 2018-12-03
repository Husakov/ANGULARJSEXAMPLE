module.exports = function (module) {
    module
        .factory('inboxesList', function (Admin, Team, App, MessengerIO, dialogs, Profile, pubSub, $q) {
            'ngInject';

            let currentUser = Profile.get(),
                inboxesList;

            function initInboxes() {
                return $q.all([
                    Admin.allAdmins().$promise,
                    Team.allTeams().$promise,
                    App.queryInboxes().$promise
                ]).then(([admins, teams, allInboxes]) => {
                    const inboxes = {
                        myInbox: [],
                        teams: []
                    };

                    admins.forEach((adminItem) => {
                        if (adminItem.is_me) {
                            const foundItem = allInboxes.find(allInboxesItem => allInboxesItem.id === adminItem.id);
                            angular.extend(adminItem, foundItem);
                            inboxes.myInbox[0] = adminItem;
                        }
                    });

                    allInboxes.forEach((inboxItem) => {
                        if (inboxItem.identifier === 'all') {
                            inboxItem.icon = 'circle';
                            inboxItem.name = 'All Conversations';
                            inboxes.teams.push(inboxItem);
                        }

                        if (inboxItem.identifier === 'mentioned') {
                            inboxItem.icon = 'circle';
                            inboxItem.name = '@ Mentions';
                            inboxes.myInbox[1] = inboxItem;
                        }

                        if (inboxItem.identifier === 'unassigned') {
                            inboxItem.icon = 'circle';
                            inboxes.myInbox[2] = inboxItem;
                        }
                    });

                    teams.forEach((teamItem) => {
                        const foundItem = allInboxes.find(allInboxesItem => allInboxesItem.id === teamItem.id);
                        angular.extend(teamItem, foundItem);
                    });

                    teams.sort((a, b) => b.is_default);

                    inboxes.teams = inboxes.teams.concat(teams);

                    return inboxes;
                });
            }

            function findInbox(inboxes, identifier) {
                let result = null;

                for (const prop in inboxes) {
                    if (inboxes.hasOwnProperty(prop)) {
                        inboxes[prop].forEach((inboxItem) => {
                            if (inboxItem.identifier === identifier) {
                                result = inboxItem;
                            }
                        });
                    }
                }

                return result;
            }

            class InboxesList extends pubSub.EventEmitter {
                constructor() {
                    super();
                    this.ready = this.initInboxes();
                }

                initInboxes() {
                    this.inboxes = null;
                    return initInboxes()
                        .then((inboxes) => {
                            this.inboxes = inboxes;
                            this.emit('updated');
                        });
                }

                findInbox(identifier) {
                    return findInbox(this.inboxes, identifier);
                }

                isInInbox(inbox, conversation) {
                    let assignee_id = conversation ? conversation.assignee_id : null,
                        identifier = inbox.identifier;
                    if (identifier === 'all' || identifier === assignee_id) {
                        return true;
                    } else if (identifier === 'mentioned') {
                        return conversation.mentioned_admins.includes(currentUser.id)
                    } else if (identifier === 'unassigned') {
                        return !assignee_id;
                    } else {
                        return _.some(inbox.members, m => m.identifier === assignee_id);
                    }
                }

            }

            inboxesList = new InboxesList();

            MessengerIO.on(function (event, id, data) {
                if (event !== 'message') {
                    return;
                }
                if (['assignment', 'close', 'open'].includes(data.message.sub_type) || data.is_new_conversation) {
                    inboxesList.initInboxes();
                }
            });

            return inboxesList;
        });
};
