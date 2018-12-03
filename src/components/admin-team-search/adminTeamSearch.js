require('./adminTeamSearch.scss');

class Controller {

    constructor(AdminTeamSearchHelper) {
        'ngInject';

        this.options = angular.merge({
            admins: true,
            teams: true,
            inboxes: false
        }, this.userOptions || {});

        this.searchHelper = new AdminTeamSearchHelper(this.options);
    }

    $onInit() {
        this.labels = angular.merge({
            searchButton: 'Search',
            admins: 'Teammates',
            noAdmins: 'No teammates found',
            teams: 'Teams',
            noTeams: 'No teams found',
            inboxes: 'Inboxes',
            noInboxes: 'No inboxes found'
        }, this.labels || {});
    }

    select(value) {
        value.selected = value.admin || value.team || value.inbox;

        if (value.selected.id === this.activeAdminTeamId) {
            return;
        }

        this.onSelect(value);
    }
}

const mod = angular.module('intercom.components.adminTeamSearch', [])
    .component('adminTeamSearch', {
        transclude: true,
        templateUrl: require('./index.html'),
        controller: Controller,
        bindings: {
            userOptions: '<options',
            labels: '<',
            activeAdminTeamId: '<',
            onSelect: '&'
        }
    });

require('./SearchHelper')(mod);

module.exports = mod;
