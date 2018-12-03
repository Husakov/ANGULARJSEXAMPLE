module.exports = function (mod) {
    require('./popover.scss');

    const templateUrl = require('./index.html');

    class Controller {
        constructor(dropdownHelper, $templateCache, $document, $scope, $compile) {
            'ngInject';
            this.$templateCache = $templateCache;
            this.$document = $document;
            this.$compile = $compile;

            let template = $templateCache.get(templateUrl);
            this.popover = new dropdownHelper.DropdownComponent($scope.$new(), template);
            this.$container = this.popover.$element.find('.te-popover-container');
            this.$container.on('click keydown', $e => $e.stopPropagation());
            this._onHideListeners = [];
        }

        $onInit() {
            this.editor.popover = this;
        }

        show(template, $scope, $onElement, isTemplateByUrl = false) {
            if (isTemplateByUrl) {
                template = this.$templateCache.get(template);
            }
            let content = _.isString(template) ? this.$compile(template)($scope) : template;
            content.on('$destroy', function () {
                $scope.$destroy();
            });
            this.hide();
            this.$container.append(content);
            $scope.$element = content;
            this.updatePosition($onElement);
            _.defer(() => {
                let hide = () => this.hide();
                this.$document.one('click keydown', hide);
                this.onHide(() => {
                    this.$document.off('click keydown', hide);
                }, $scope);
            });
        }

        updatePosition($onElement) {
            function getRect() {
                let rect = $onElement.offset();
                rect.bottom = rect.top + $onElement.outerHeight();
                rect.right = rect.left + $onElement.outerWidth();
                return rect;
            }

            const method = this.popover.hidden ? 'show' : 'setPosition';

            this.popover[method](getRect, ['center', 'top']);
        }

        hide() {
            this.popover.hide();
            this._onHideListeners.forEach(cb => cb());
            this._onHideListeners = [];
            this.$container.empty();
        }

        onHide(cb, $scope) {
            this._onHideListeners.push(cb);
            $scope.$on('$destroy', () => {
                _.pull(this._onHideListeners, cb);
            })
        }
    }

    mod.component('textEditorPopover', {
        controller: Controller,
        require: {
            editor: '^textEditor'
        }
    });
};
