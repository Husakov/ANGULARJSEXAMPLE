const templateUrl = require('./index.html');

class Controller {
    constructor($scope, Attributes) {
        'ngInject';

        this.$scope = $scope;
        this.resource = Attributes;

        this.attribute = {
            type: 'string',
            title: '',
            description: '',
            is_company: false,
            is_custom: true
        };

        this.dataTypes = [
            {
                title: 'Text',
                name: 'string'
            },
            {
                title: 'Date',
                name: 'date'
            },
            {
                title: 'Number',
                name: 'number'
            },
            {
                title: 'Boolean',
                name: 'boolean'
            }
        ];
    }

    createAttribute() {
        this.attribute.name = 'custom_data.' + _.snakeCase(this.attribute.title);
        this.resource.save(this.attribute).$promise
            .then((attribute) => {
                this.$scope.$close(attribute);
            });
    }

    cancel() {
        this.$scope.$dismiss();
    }
}

module.exports = {
    name: 'editAttribute',
    open: function ($uibModal) {
        const modalInstance = $uibModal.open({
            templateUrl,
            controller: Controller,
            controllerAs: '$ctrl'
        });
        return modalInstance.result;
    }
};
