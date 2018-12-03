module.exports = function (mod) {
    require('./toolbar.scss');

    class Controller {
        constructor($element, $scope, textEditorActions) {
            'ngInject';
            this.textEditorActions = textEditorActions;
            this.$element = $element;
            this.$scope = $scope;

            Object.defineProperty($scope, 'injector', {
                get: () => this.editor.injector || null
            });
            Object.defineProperty($scope, 'editor', {
                get: () => this.editor || null
            });

            $scope.$watch(() => this.editor, () => this.$onInit());
        }

        $onInit() {
            if (this.editor) {
                this.$element.addClass(this.editor.idClass);
                this.tools = this.toolsArray
                    .map(cat => cat
                        .map(toolName => this.textEditorActions.getActionToolScope(toolName, this.$scope))
                        .filter(tool => !!tool)
                    )
                    .filter(cat => cat && cat.length);
                this.editor.emitter.on('updateStyles', ($e, selection) => this.updateStyles(selection), this.$scope);
            }
        }

        updateStyles(selection) {
            this.tools
                .forEach(cat => cat
                    .forEach(tool => {
                        tool.active = tool.isActive(selection);
                    }));
            _.defer(() => this.$scope.$apply());
        }
    }

    mod.component('textEditorToolbar', {
        templateUrl: require('./index.html'),
        controller: Controller,
        bindings: {
            editor: '=',
            toolsArray: '=tools'
        }
    });
};
