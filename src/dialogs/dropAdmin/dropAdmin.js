const templateUrl = require('./index.html');

class Controller {
    constructor($scope, admin, $timeout, Team, Admin) {
        'ngInject';
        this.$timeout = $timeout;
        this.$scope = $scope;
        this.admins = Admin.query();
        this.teams = Team.query();

        this.selectedAdmin = angular.copy(admin);
        this.formReady = false;
    }

    changeNewSender (value) {
        this.newSender = value;
        this.check()
    }

    changeNewAssignee (value) {
        this.newAssignee = value;
        this.check()
    }

    check() {
        this.formReady = !!(this.newSender && this.newAssignee);
    }
    
    dropAdmin(userId) {
        this.$scope.$close(userId);
    }

    cancel() {
        this.$scope.$dismiss();
    }
}

module.exports = {
    name: 'dropAdmin',
    open: function ($uibModal, admin) {
        const modalInstance = $uibModal.open({
            templateUrl,
            controller: Controller,
            controllerAs: '$ctrl',
            resolve: {
                admin
            }
        });

        return modalInstance.result;
    }
};
