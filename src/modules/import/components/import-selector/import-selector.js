module.exports = function (module) {

    class Controller {
        constructor(importImportTypesHelper) {
            'ngInject'

            this.importTypes = importImportTypesHelper.types;
        }
    }

    module
        .component('importSelector', {
            templateUrl: require('./import-selector.html'),
            controller: Controller,
            controllerAs: '$ctrl'
        });
};
