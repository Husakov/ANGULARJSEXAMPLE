module.exports = function (module) {
    module
        .factory('AdminTeamSearchHelper', function (Admin, Team) {
            'ngInject';

            let admins = Admin.query(),
                teams = Team.query(),
                inboxes = [{
                    name: 'Unnasigned',
                    id: null,
                    sub_type: 'assignment',
                    assignee_id: null
                }];

            class SearchHelper {
                constructor(options) {
                    this.options = options;
                    if (options.admins) {
                        this.admins = admins;
                    }
                    if (options.teams) {
                        this.teams = teams;
                    }
                    if (options.inboxes) {
                        this.inboxes = inboxes;
                    }
                    this.searchString = '';
                }

                input(text) {
                    if (arguments.length) {
                        let filter = el => !text.length || el.name && el.name.toLowerCase().includes(text.toLowerCase());
                        this.searchString = text;
                        if (this.options.admins) {
                            this.admins = admins.filter(filter);
                        }
                        if (this.options.teams) {
                            this.teams = teams.filter(filter);
                        }
                        if (this.options.inboxes) {
                            this.inboxes = inboxes.filter(filter);
                        }
                    }
                    return this.searchString;
                }
            }

            return SearchHelper;
        });
};
