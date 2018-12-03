module.exports = function (module) {
    const Step = require('../../Step');
    const constants = require('../constants');

    class Controller extends Step {
        constructor($element, Import) {
            'ngInject';
            super($element);
            this.Import = Import;
            this.uploaded = false;
            this.description = 'Import users or leads';
            this.className = 'recipients-step';

            this.recipientsTypes = constants.recipientsTypes;

            this.help = constants.fileHelp;
        }

        validate() {
            return !!this.model.recipients && !!this.file;
        }

        selectFile(file) {
            this.file = file;
            this.uploaded = false;
        }

        removeFile() {
            delete this.file;
            this.uploaded = false;
        }

        next() {
            if (!this.uploaded) {
                return this.Import
                    .CSV
                    .upload({}, this.file)
                    .$promise
                    .then(data => {
                        this.model.fileData = data;
                        this.uploaded = true;
                    });
            }
        }
    }

    module
        .component('importCsvRecipientsStep', {
            templateUrl: require('./index.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                onReady: '&',
                model: '=',
                done: '&'
            }
        });
};
