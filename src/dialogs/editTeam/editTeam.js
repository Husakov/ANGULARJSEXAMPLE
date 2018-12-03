const templateUrl = require('./index.html');

require('./editTeam.scss');

class Controller {
    constructor(Team, $scope, currentTeam) {
        'ngInject';

        this.Team = Team;
        this.$scope = $scope;

        if (currentTeam) {
            this.team = currentTeam;
        } else {
            this.isNew = true;
            this.team = new this.Team({
                avatar_emoji: '🏢',
                name: 'New',
                members: [],
                member_ids: []
            });
        }
    }

    saveTeam() {
        let action = 'update';
        if (this.isNew) {
            action = 'save';
        }
        this.Team[action](this.team).$promise
            .then((team) => {
                this.$scope.$close(team);
            });
    }

    cancel() {
        this.$scope.$dismiss();
    }
}

module.exports = {
    name: 'editTeam',
    open: function ($uibModal, currentTeam) {
        const modalInstance = $uibModal.open({
            templateUrl,
            controller: Controller,
            controllerAs: '$ctrl',
            windowClass: 'edit-team-dialog',
            resolve: {
                currentTeam
            }
        });
        return modalInstance.result;
    }
};
