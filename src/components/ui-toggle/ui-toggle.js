require('./ui-toggle.scss');

const configs = {
    on: 'On',
    off: 'Off',
    onStyle: 'on-success',
    offStyle: 'off-warning'
};

class Controller {
    constructor($element, $scope) {
        'ngInject';

        this.$element = $element;
        this.$scope = $scope;
        this.value = false;
        this.styles = [];
    }

    $onInit() {
        this.on = angular.isDefined(this.labelTrue) ? this.labelTrue : configs.on;
        this.off = angular.isDefined(this.labelTrue) ? this.labelFalse : configs.off;

        if (angular.isDefined(this.styleBind)) {
            this.styles.push(...this.styleBind.split(' '));
        }
        if (!_.some(this.styles, s => s.includes('on-'))) {
            this.styles.push(configs.onStyle);
        }
        if (!_.some(this.styles, s => s.includes('off-'))) {
            this.styles.push(configs.offStyle);
        }

        this.initStyles();

        if (this.ngModel) {
            if (angular.isDefined(this.ngModel.$viewValue)) {
                this.value = this.ngModel.$viewValue;
            } else {
                this.value = false;
            }
            this.ngModel.$render = () => {
                this.value = this.ngModel.$viewValue;
            };
        }

        this.$element.find('label').click(($e) => $e.stopPropagation());

        this.$scope.$watch(() => this.value, (newVal, oldVal) => {
            if (newVal !== oldVal && this.ngModel.$viewValue !== this.value) {
                if (this.ngModel) {
                    this.ngModel.$setViewValue(this.value);
                }
                if (this.onChange) {
                    this.onChange({$value: this.value});
                }
            }
        });
    }

    initStyles() {
        const $texts = this.$element.find('.text');
        $texts.filter('.on').html(this.on);
        $texts.filter('.off').html(this.off);
        if ($texts[0].offsetWidth && $texts[1].offsetWidth) {
            const width = Math.max($texts[0].offsetWidth, $texts[1].offsetWidth);
            this.$element.find('.slider')
                .addClass('inited')
                .css({width: width});
        }
    }
}

module.exports = angular.module('intercom.components.uiToggle', [])
    .component('uiToggle', {
        templateUrl: require('./index.html'),
        controller: Controller,
        require: {
            ngModel: '^?'
        },
        bindings: {
            labelTrue: '@on',
            labelFalse: '@off',
            styleBind: '@styles',
            onChange: '&?'
        }
    });
