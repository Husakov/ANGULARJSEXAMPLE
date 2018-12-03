'use strict';

let templateUrl = require('./index.html');

module.exports = {
    name: 'confirm',
    open: function ($uibModal, options) {
        let modalInstance = $uibModal.open({
            templateUrl: templateUrl,
            controller: require('../baseModalCtrl'),
            controllerAs: '$ctrl',
            resolve: {
                options: function () {
                    return _.defaults({}, options, {
                        title: '',
                        body: ''
                    });
                }
            }
        });

        return modalInstance.result;
    }
};