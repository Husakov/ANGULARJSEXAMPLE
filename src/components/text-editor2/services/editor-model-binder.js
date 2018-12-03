module.exports = function (mod) {

    mod.factory('textEditorModelBinder', function (textEditorHtmlFixer, textEditorSelectionHelper, TextEditorParser, textEditorActions, $document, $compile) {
        'ngInject';

        const selectionHelper = textEditorSelectionHelper;

        function throttleEvent(editor, event, data) {
            return _.throttle(() => {
                editor.emitter.emit(event, _.result({data}, 'data'));
            }, 100);
        }

        const emptyBlockValues = ['<br>', '<br/>', ''];

        function isEmptyBlock(block) {
            return block.type === 'paragraph' && (emptyBlockValues.includes(block.text));
        }

        class ModelBinder {
            bind(ngModel, $textElement, editor) {
                const parser = new TextEditorParser({parseVideoUrls: editor.options.parseVideoUrls});
                const updateStyles = throttleEvent(editor, 'updateStyles', () => selectionHelper.getSelection());
                const change = throttleEvent(editor, 'change');
                editor.injector.parser = parser;

                function toViewValue() {
                    textEditorHtmlFixer.fixHtml($textElement);
                    const blocks = parser.toBlocks($textElement.html());
                    if (!angular.equals(blocks, ngModel.$viewValue)) {
                        ngModel.$setViewValue(blocks);
                        change();
                    }
                }

                function fromViewValue() {
                    const html = parser.toHtml(ngModel.$viewValue);
                    $textElement.html(html);
                    $compile($textElement)(editor.$scope);
                    textEditorHtmlFixer.fixHtml($textElement);
                    change();
                }

                function selection() {
                    let selection = selectionHelper.getSelection();

                    if (selectionHelper.isIn(selection, $textElement)) {
                        editor.emitter.emit('selection', selection);
                    } else {
                        editor.emitter.emit('selection-out', selection);
                    }
                }

                $textElement.on('paste', ($e) => {
                    $e.preventDefault();
                    let clipboardData = ($e.originalEvent || $e).clipboardData,
                        text = clipboardData.getData('text/plain');
                    editor.injector.insertText(text);
                });
                $textElement.on('input', toViewValue);
                $textElement.on('keypress', ($e) => {
                    editor.onKeypress({$event: $e})
                });
                ngModel.$render = fromViewValue;

                let fixesOff = textEditorHtmlFixer.fixActions($textElement, editor);
                let actionsOff = textEditorActions.bind($textElement, editor);

                $document.on('mousedown mouseup keydown keyup', updateStyles);
                $document.on('mouseup keyup paste', selection);

                editor.emitter.on('updateStyles', () => {
                    let selection = selectionHelper.getSelection(),
                        range = selectionHelper.getRange(selection),
                        $active = selectionHelper.getTopNodesOfRange($textElement, range);

                    editor.isFocused = $active && !$active.is($textElement) && selectionHelper.isInTree($active, $textElement);
                    editor.isActive = selectionHelper.isInTree($active, `.${editor.idClass}`);

                    if (editor.isFocused) {
                        editor.setLastRange(selectionHelper.getRange(selection));
                    }
                }, editor.$scope);

                editor.emitter.on('change', () => {
                    let blocks = ngModel.$viewValue;
                    editor.hasNoContent = !blocks || blocks.length === 0 || blocks.length === 1 && isEmptyBlock(blocks[0]);
                });

                editor.emitter.on('sync', () => {
                    toViewValue();
                    updateStyles();
                    selection();
                }, editor.$scope);

                editor.emitter.on('commit', () => {
                    toViewValue();
                }, editor.$scope);

                editor.$scope.$on('$destroy', () => {
                    $document.off('mousedown mouseup keydown keyup', updateStyles);
                    $document.off('mouseup keyup paste', selection);
                    actionsOff();
                    fixesOff();
                });
            }
        }

        return new ModelBinder();
    });
};
