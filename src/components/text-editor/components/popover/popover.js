module.exports = function (mod) {
    require('./popover.scss');

    const templateUrl = require('./index.html');

    class Controller {
        constructor(textEditorManager, dropdownHelper, $templateCache, $document, $scope, $compile, $timeout) {
            'ngInject';
            this.manager = textEditorManager;
            this.$document = $document;
            this.$compile = $compile;
            this.$timeout = $timeout;

            let template = $templateCache.get(templateUrl);
            this.popover = new dropdownHelper.DropdownComponent($scope.$new(), template);
            this.$container = this.popover.$element.find('.te-popover-container');
            this.$container.on('click keydown', $e => $e.stopPropagation());
            this._onHideListeners = [];
        }

        $onInit() {
            this.manager.registerComponent(this.editorName, this);
            this.manager.getEditor(this.editorName)
                .then(editor => {
                    editor.setPopover(this);
                });
        }

        show(template, $scope, $onElement) {
            let content = _.isString(template) ? this.$compile(template)($scope) : template;
            content.on('$destroy', function () {
                $scope.$destroy();
            });
            this.hide();
            this.$container.append(content);
            $scope.$element = content;
            this.updatePosition($onElement);
            this.$timeout(() => {
                this.$document.one('click keydown', () => this.hide())
            });
        }

        updatePosition($onElement) {
            let rect = $onElement.offset();
            rect.bottom = rect.top + $onElement.outerHeight();
            rect.right = rect.left + $onElement.outerWidth();
            this.popover.show(rect, ['center', 'top']);
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
        bindings: {
            editorName: '@'
        }
    });
};
