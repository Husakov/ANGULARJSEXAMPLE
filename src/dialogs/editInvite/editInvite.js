const templateUrl = require('./index.html');

require('./editInvite.scss');

class Controller {
    constructor($scope, user, Invites) {
        'ngInject';

        this.$scope = $scope;
        this.Invites = Invites;
        if (user && user.creatingInvite) {
            this.creatingInvite = true;
            this.invitation = user;
        } else if (user) {
            this.creatingInvite = false;
            this.invitation = user;
        } else {
            this.creatingInvite = true;
            this.invitation = {
                email: '',
                role: 'full_access',
                description: 'full_access',
                can_access_settings_and_billing: true,
                can_export_data: true,
                can_send_messages: true
            };
        }
        
        $scope.$watch(() => this.invitation.role, (value) => {
            if (value == 'full_access') {
                this.invitation.can_access_settings_and_billing = true;
                this.invitation.can_export_data = true;
                this.invitation.can_send_messages = true;
            }
        });
    }

    sendInvite() {
        if (this.invitation.email) {
            this.Invites.makeInvite(this.invitation).$promise.then((answer) => {
                this.$scope.$close(answer);
            });
        }
    }

    changePermissions(user) {
        let filtered = _.pick(user, 'role', 'description', 'can_access_settings_and_billing', 'can_export_data', 'can_send_messages')
        this.Invites.update({token: user.invite_token}, filtered).$promise.then(answer => {
            this.$scope.$close(answer);
        });
    }

    cancel() {
        this.$scope.$dismiss();
    }
}

module.exports = {
    name: 'editInvite',
    open: function ($uibModal, user) {
        const modalInstance = $uibModal.open({
            templateUrl,
            controller: Controller,
            controllerAs: '$ctrl',
            resolve: {
                user
            }
        });
        return modalInstance.result;
    }
};
