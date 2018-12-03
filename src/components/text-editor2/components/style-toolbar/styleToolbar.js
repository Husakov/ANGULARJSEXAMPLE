module.exports = function (mod) {

    require('./styleToolbar.scss');

    const tools = [
        ['bold'],
        ['italic'],
        ['p', 'h1', 'h2'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
        ['link']
    ];

    const template = '<text-editor-toolbar tools="$ctrl.tools" editor="$ctrl.editor" class="text-editor-style-toolbar"></text-editor-toolbar>';

    class Controller {
        constructor($scope, textEditorSelectionHelper, dropdownHelper, $timeout, $document) {
            'ngInject';
            this.$scope = $scope;
            this.selectionHelper = textEditorSelectionHelper;
            this.$timeout = $timeout;
            this.tools = tools;

            this.component = new dropdownHelper.DropdownComponent($scope, template, {closeOnOutside: true});

            const handler = ($e) => {
                if (this.selectionHelper.isInTree(angular.element($e.target), this.component.$element)) {
                    $e.stopPropagation();
                } else {
                    this.component.hide();
                }
            };
            $document.on('mousedown keydown', handler);
            $scope.$on('$destroy', () => $document.off('mousedown keydown', handler));
        }

        $onInit() {
            this.editor.emitter.on('selection', ($e, s) => this.show(s), this.$scope);
            this.editor.emitter.on('selection-out', () => this.component.hide(), this.$scope);
        }

        show() {
            this.$timeout(() => {
                let selection = this.selectionHelper.getSelection(),
                    isIn = this.selectionHelper.isIn(selection, this.editor.$textContent);
                if (isIn && this.selectionHelper.hasValidText(selection)) {
                    const getRect = () => this.selectionHelper.getSelectedRect(selection);
                    this.component.show(getRect, ['center', 'top'])
                } else {
                    this.component.hide();
                }
            }, 10);
        }
    }

    mod.component('textEditorStyleToolbar', {
        controller: Controller,
        require: {
            editor: '^textEditor'
        }
    });
};
