module.exports = function (mod) {
    require('./baseComponent.scss');

    class Controller {
        constructor(textEditorSelectionHelper, $compile, $element, $scope, $timeout) {
            'ngInject';
            this.selectionHelper = textEditorSelectionHelper;
            this.$compile = $compile;
            this.$element = $element;
            this.$scope = $scope;
            $element.attr('contenteditable', false);
            this.initContent();

            this.$trap = $element.find('.trap');

            $element.on('focus', '.trap', ($e) => {
                if (!this.selectionHelper.isInTree(angular.element($e.relatedTarget), this.$element)) {
                    $scope.$broadcast('focus');
                }
            });
            $element.on('keydown', ($e) => this.onKey($e));
            $element.on('mousedown mouseup', () => $scope.$broadcast('inside'));

            $scope.$on('inside', () => {
                $timeout(() => this.editor.setLastRange(this.selectionHelper.getRangeInElement(this.$trap)));
            });
        }

        initContent() {
            let {type} = this.getModel();
            if (type) {
                let $node = this.$compile(`<te-${type}></te-${type}>`)(this.$scope);
                this.$element.find('.content').append($node)
            }
        }

        newLine(isBefore) {
            this.editor.injector.insertLine(this.$element, isBefore);
        }

        remove() {
            this.newLine();
            this.$element.remove();
        }

        setModel(model) {
            this.$element.attr('data-model', _.escape(angular.toJson(model)));
            this.editor.emitter.emit('commit');
        }

        getModel() {
            return angular.fromJson(_.unescape(this.$element.attr('data-model')));
        }

        onKey($e) {
            switch ($e.keyCode) {
                case 33://moving out up
                case 36:
                case 37:
                case 38:
                case 34://moving out down
                case 35:
                case 39:
                case 40:
                    this.selectionHelper.moveInElement(this.$trap);
                    break;
                default:
                    break;
            }
        }
    }

    mod.component('teComponent', {
        controller: Controller,
        require: {
            editor: '^textEditor'
        },
        bindings: {
            injected: '@?'
        },
        templateUrl: require('./index.html')
    });
};
