module.exports = function (module) {
    const templateUrl = require('./index.html');

    class Controller {
        constructor($scope, email) {
            'ngInject';
            this.$scope = $scope;
            this.emailToSend = angular.copy(email);
        }

        sendEmail() {
            this.$scope.$close(this.emailToSend);
        }

        cancel() {
            this.$scope.$dismiss();
        }
    }

    module
        .config(function (dialogsProvider) {
            'ngInject';
            dialogsProvider
                .register({
                    name: 'sendTestEmail',
                    open: function ($uibModal, email) {
                        const modalInstance = $uibModal.open({
                            templateUrl,
                            controller: Controller,
                            controllerAs: '$ctrl',
                            resolve: {
                                email: () => email
                            }
                        });

                        return modalInstance.result;
                    }
                });
        });
};
