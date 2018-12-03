module.exports = function (module) {
    const templateUrl = require('./index.html');

    class Controller {
        constructor(dialogs, $scope) {
            'ngInject';
            this.dialogs = dialogs;
            this.$scope = $scope;
            this.isCompanies = false;
        }

        $onInit() {
            this.$scope.$watch(
                () => this.main.isCompanies(),
                () => this.isCompanies = this.main.isCompanies()
            );
        }

        getLabel() {
            return this.main.getLabel();
        }

        deleteList() {
            this.main.deleteList();
        }
    }

    module
        .component('contactsListActions', {
            templateUrl,
            controller: Controller,
            bindings: {
                main: '<'
            }
        });
};
