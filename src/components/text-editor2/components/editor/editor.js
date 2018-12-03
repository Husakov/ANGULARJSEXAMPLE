module.exports = function (mod) {
    require('./editor.scss');

    class Controller {
        constructor(textEditorModelBinder, TextEditorInjector, TextEditorState, textEditorSelectionHelper, $element, $scope, pubSub, $attrs) {
            'ngInject';
            this.emitter = new pubSub.EventEmitter();
            this.modelBinder = textEditorModelBinder;
            this.selectionHelper = textEditorSelectionHelper;
            this.injector = new TextEditorInjector(this);
            this.$element = $element;
            this.$scope = $scope;

            if ($attrs.placeholder) {
                this.placeholder = $attrs.placeholder;
            }

            this.$textContent = $element.find('.text-content');
            this.refer = this;
            this.idClass = _.uniqueId('textEditor');

            this.isFocused = false;
            this.isActive = false;
            this.hasNoContent = true;

            this.options = angular.extend({
                parseVideoUrls: false,
                newLineOnEnter: true,
                newLineOnShiftEnter: true,
                saveStateId: false
            }, this.userOptions);

            this.state = new TextEditorState(this, this.options.saveStateId);
        }

        $onInit() {
            this.onKeypress = this.onKeypress || angular.noop;

            this.modelBinder.bind(this.ngModel, this.$textContent, this);
            this.$element.addClass(this.idClass);
            this.state.init();
        }

        isDisabled() {
            return false;
        }

        setLastRange(range) {
            this.lastRange = range;
            this.lastValidRange = this.selectionHelper.validateRange(this.$textContent, range);
        }

        focus(onInvalidRange = false) {
            this.selectionHelper
                .focus(
                    this.$textContent,
                    this.lastRange, !onInvalidRange ? this.lastValidRange : this.lastRange,
                    ($el) => this.injector.insertLine($el)
                );
        }

        blur() {
            this.selectionHelper.clearSelection();
        }

        clear() {
            this.$textContent.html('');
            this.lastRange = null;
            this.lastValidRange = null;
            this.emitter.emit('commit');
        }

        isEmpty() {
            return this.hasNoContent;
        }
    }

    mod.component('textEditor', {
        templateUrl: require('./index.html'),
        controller: Controller,
        require: {
            ngModel: '^ngModel'
        },
        bindings: {
            refer: '=?',
            onKeypress: '&?',
            userOptions: '=?options'
        }
    });
};
