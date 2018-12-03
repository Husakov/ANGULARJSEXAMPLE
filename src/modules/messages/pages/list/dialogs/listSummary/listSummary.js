module.exports = function (module) {
    const templateUrl = require('./index.html');
    require('./listSummary.scss');

    class Controller {
        constructor($scope) {
            'ngInject';
            this.$scope = $scope;
            this.enteredAutomation = 20222;
            this.automationNow = 8011;
            this.exitedAutomation = 5102;
            this.reacedAutomation = 1530;

            this.percentReaced = this.percentOf(this.reacedAutomation, this.enteredAutomation);
        }

        percentOf(value, from) {
            return value*100/from;
        }

        formatValue(value, comma, maxSigns) {
            value = value.toString();
            value = maxSigns ? value.substring(0,maxSigns+1) : value;
            value = comma ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : value;
            return value;
        }

        close() {
            this.$scope.$dismiss();
        }
    }

    module
        .config(function (dialogsProvider) {
            'ngInject';
            dialogsProvider
                .register({
                    name: 'messagesListSummary',
                    open: function ($uibModal) {
                        let modalInstance = $uibModal.open({
                            templateUrl: templateUrl,
                            controller: Controller,
                            controllerAs: '$ctrl',
                            windowClass: 'summary-modal',
                            backdropClass: 'overlay-background light-background'
                        });

                        return modalInstance.result;
                    }
                });
        });
};
