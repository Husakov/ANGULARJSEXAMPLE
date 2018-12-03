require('./secondmenu.scss');

class Controller {
    constructor($element, menus) {
        'ngInject';
        this.$element = $element;
        menus.register('secondmenu', this);
    }
}

module.exports = angular.module('intercom.components.secondmenu', [])
    .component('secondmenu', {
        controller: Controller
    });
