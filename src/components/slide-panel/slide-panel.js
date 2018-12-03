require('./slide-panel.scss');

let templateUrl = require('./slide-panel.html');

class Controller {

    constructor($scope, $element, $timeout, pubSub) {
        'ngInject';
        this.$element = $element;
        this.$timeout = $timeout;

        this.slideContentElements = angular.element('.app-container');
        this.slidePanelElement = $element.find('.slide-panel');

        $scope.$watch(() => this.isOpen, (value) => {
            this.toggle(value);
        });

        $scope.$on('$destroy', () => this.close());
        pubSub.onStateChanged(() => this.close(), $scope);

        this.timeoutPromise = null;
    }

    toggle(status = !this.isOpen) {
        let classes = this.slideAppContainer ? 'visible-panel slided-panel' : 'visible-panel';

        if (status) {
            if (this.timeoutPromise) {
                this.$timeout.cancel(this.timeoutPromise);
            }
            this.$element.addClass(classes);
            if (this.slideAppContainer) {
                let slidePanelWidth = this.slidePanelElement[0].clientWidth;
                this.slideContentElements.css('transform', 'translateX(-' + slidePanelWidth + 'px)');
            }
        } else {
            if (this.slideAppContainer) {
                this.slideContentElements.css('transform', 'translateX(0)');
            }
            this.timeoutPromise = this.$timeout(() => {
                this.$element.removeClass(classes);
            }, 1000);
            this.timeoutPromise.then(() => this.timeoutPromise = null);
        }
        this.isOpen = status;
    }

    close() {
        if (this.isOpen) {
            this.toggle(false);
        }
    }
}

module.exports = angular.module('intercom.components.slidePanel', [])
    .component('slidePanel', {
        templateUrl: templateUrl,
        controller: Controller,
        transclude: true,
        bindings: {
            isOpen: '=',
            background: '=',
            darkBackground: '=',
            fromBottom: '=',
            slideAppContainer: '='
        }
    });
