const templateUrl = require('./index.html');

class Controller {
    constructor($scope, companyMode) {
        'ngInject';

        this.$scope = $scope;

        this.subject = '';
        this.exportAll = false;
        this.exportType = [{
            name: 'Export with the currently displayed columns.',
            value: false
        }, {
            name: 'Export with all columns.',
            value: true
        }];
        this.companyList = companyMode ? 'companies' : 'users';
    }

    close(exportAll) {
        this.$scope.$close(exportAll);
    }

    cancel() {
        this.$scope.$dismiss();
    }
}

module.exports = {
    name: 'exportList',
    open: function ($uibModal, companyMode) {
        const modalInstance = $uibModal.open({
            templateUrl,
            controller: Controller,
            controllerAs: '$ctrl',
            resolve: {
                companyMode
            }
        });

        return modalInstance.result;
    }
};
