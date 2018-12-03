module.exports = function (module) {
    let templateUrl = require('./index.html');

    class Controller {
        constructor($scope) {
            'ngInject';
            this.$scope = $scope;

            $scope.$watch(() => this.user, () => {
                this.toogle_profile = true;
            });

            $scope.$watch(() => this.toogle_profile, (value) => {
                if (!value) {
                    this.currentVisibleCompany = this.user.companies[0];
                }
            });

            $scope.$watch(() => this.isOpen(), function (value) {
                if (value) {
                    $scope.$broadcast('update');
                }
            });
        }

        isOpen() {
            return this.$scope.$parent.isOpen;
        }
    }

    module
        .component('inboxProfilePanel', {
            templateUrl,
            controller: Controller,
            bindings: {
                'user': '='
            }
        });
};
