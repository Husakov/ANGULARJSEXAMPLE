'use strict';

module.exports = class BaseModal {
    constructor($scope, options) {
        'ngInject';
        this.$scope = $scope;

        this.options = _.defaults({}, options, {
            closeText: 'Ok',
            closeClass: 'btn-danger',
            cancelText: 'Cancel',
            cancelClass: 'btn-default'
        });
    }

    close() {
        this.$scope.$close();
    }

    cancel() {
        this.$scope.$dismiss();
    }
};
