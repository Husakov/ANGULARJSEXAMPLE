module.exports = function (mod) {
    require('./button.scss');

    const popoverTemplateUrl = require('./popover.html');

    const httpRegExpPrefix = /^https?:\/\//i;
    const formatter = {
        linkUrl: {
            $parsers: [function (value) {
                if (!httpRegExpPrefix.test(value)) {
                    value = `http://${value}`;
                }
                return value;
            }]
        }
    };

    class Controller {
        constructor($scope, $element, $templateCache, $timeout) {
            'ngInject';
            this.$scope = $scope;
            this.$buttonElement = $element.find('.mnh-m-btn');
            this.popoverTemplate = $templateCache.get(popoverTemplateUrl);
            this.$timeout = $timeout;
            this.formatter = formatter;
            this.setPopoverType(null);
            this.popover = null;

            $scope.$watch(() => this.model.text, () => this.updatePopoverPosition());
            $scope.$watch(() => this.model, () => this.commitModel(), true);
            $scope.$on('focus', () => {
                this.$buttonElement.focus();
                this.$buttonElement.click();
            });
        }

        $onInit() {
            if (this.container.injected) {
                this.$timeout(() => {
                    this.$buttonElement.focus();
                    this.$buttonElement.click();
                    this.container.$scope.$broadcast('inside');
                });
            }

            this.model = angular.merge(
                this.model || {},
                {
                    type: 'button',
                    linkUrl: '',
                    text: '',
                    align: 'left'
                },
                this.container.getModel()
            );
        }

        open($e) {
            if (this.popover) {
                this.popover.hide();
            }
            if ($e) {
                $e.preventDefault();
            }
            let $scope = this.$scope.$new();
            this.popover = this.editor.popover;
            this.popover.show(this.popoverTemplate, $scope, this.$buttonElement);
            this.popover.onHide(() => {
                this.setPopoverType(null);
                this.popover = null;
            }, $scope);
        }

        setPopoverType(type) {
            this.popoverType = type;
            this.updatePopoverPosition();

            if (type === 'link') {
                this.$timeout(() => {
                    this.popover.$container.find('input').eq(0).focus();
                }, 100);
            }
        }

        setAlign(align) {
            this.model.align = align || 'left';
            this.updatePopoverPosition();
        }

        updatePopoverPosition() {
            _.defer(() => {
                if (this.popover) {
                    this.popover.updatePosition(this.$buttonElement);
                }
            });
        }

        onKey($e) {
            switch ($e.keyCode) {
                case 8:
                case 46:
                    this.container.remove();
                    break;
                case 13:
                    this.open($e);
                    break;
                default:
                    break;
            }
        }

        commitModel() {
            this.container.setModel(this.model);
        }
    }

    mod.component('teButton', {
        controller: Controller,
        require: {
            editor: '^textEditor',
            container: '^te-component'
        },
        templateUrl: require('./index.html')
    });
};
