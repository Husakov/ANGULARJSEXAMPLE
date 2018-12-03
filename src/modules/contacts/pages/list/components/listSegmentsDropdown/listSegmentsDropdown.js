module.exports = function (module) {
    const templateUrl = require('./index.html');

    require('./listSegmentsDropdown.scss');

    class Controller {
        constructor() {
            'ngInject';

            this.selectedSegment = null;
        }
    }

    module
        .component('contactsListSegmentsDropdown', {
            templateUrl,
            controller: Controller,
            bindings: {
                selectedSegment: '<',
                segments: '<'
            }
        });
};