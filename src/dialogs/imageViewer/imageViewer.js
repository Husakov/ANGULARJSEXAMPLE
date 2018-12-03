const templateUrl = require('./index.html');
require('./imageViwer.scss');

class Controller {
    constructor(options) {
        'ngInject';
        this.src = options.src;
    }
}

module.exports = {
    name: 'imageViewer',
    open: function ($uibModal, src) {
        const modalInstance = $uibModal.open({
            templateUrl,
            controller: Controller,
            controllerAs: '$ctrl',
            resolve: {
                options: {
                    src
                }
            },
            windowClass: 'image-viewer-dialog'
        });

        return modalInstance.result;
    }
};
