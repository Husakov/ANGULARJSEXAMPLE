module.exports = function (module) {

    class Controller {
        constructor(Users, dialogs, $q, slidePanelManager, $scope) {
            'ngInject';
            this.dialogs = dialogs;
            this.$q = $q;
            this.Users = Users;
            this.$scope = $scope;

            this.listHelper = null;

            this.tagPanel = slidePanelManager.render({
                template: '<tag-search done="$ctrl.resolveTags({tags: tags})"></tag-search>',
                background: true,
                slideAppContainer: true,
                $scope: $scope.$new()
            });

            this.sortingFields = [
                {name: 'Last Seen', alias: 'last_request_at'},
                {name: 'Web sessions', alias: 'session_count'},
                {name: 'Last contacted', alias: 'last_contacted_at'},
                {name: 'Last heard from', alias: 'last_heard_from_at'}
            ]
        }

        fetch() {
            return this.$q.when(this.users)
                .then(users => {
                    users.total_count = users.length;
                    return users;
                });
        }

        messageUsers() {

        }

        getCurrentSortingName(sortingBy) {
            return _.find(this.sortingFields, function (field) {
                return field.alias == sortingBy;
            });
        }

        resolveTags({tags}) {
            this.tagPanel.toggle(false);

            let tag_ids = _.pluck(tags, 'id'),
                included_ids = _(this.users)
                                .filter(user => user.checked)
                                .pluck('id')
                                .value();

            this.Users.bulk_tags(angular.extend({}, {tag_ids}, {included_ids}));
        }
    }

    module
        .component('contactsDetailsUsersTable', {
            templateUrl: require('./index.html'),
            controller: Controller,
            bindings: {
                users: '<'
            }
        });
};
