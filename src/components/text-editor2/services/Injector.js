module.exports = function (mod) {

    mod.factory('TextEditorInjector', function (textEditorSelectionHelper, $document, $compile, $timeout) {
        'ngInject';
        const selectionHelper = textEditorSelectionHelper;

        class Injector {
            constructor(editor) {
                this.editor = editor;
            }

            execCommand(command, value) {
                return $timeout(() => {
                    this.editor.focus(true);
                    textEditorSelectionHelper
                        .doOnValidRanges(
                            this.editor.$textContent,
                            () => $document[0].execCommand(command, false, value)
                        );
                    this.editor.emitter.emit('sync');
                });
            }

            queryCommandState(...args) {
                return $document[0].queryCommandState(...args);
            }

            compile($element) {
                return $compile($element)(this.editor.$scope);
            }

            insertNode($element, isTop) {
                this.editor.focus();
                selectionHelper.insertNode(this.editor.$textContent, $element, isTop);
            }

            insertText(text) {
                this.deleteContents();
                $document[0].execCommand('insertText', false, text);
                this.editor.setLastRange(selectionHelper.getRange());
                $timeout(() => this.editor.focus());
            }

            insertBlocks(blocks) {
                let html = this.parser.toHtml(blocks),
                    $elements = $compile(html)(this.editor.$scope);
                this.insertNode($elements, true);
            }

            insertLine($element, isBefore = false) {
                const $newLine = angular.element('<p><br></p>');
                if (!$element || !$element.length) {
                    $element = selectionHelper.getTopNodesOfRange(this.editor.$textContent).last();
                } else {
                    $element = selectionHelper.getTopNodeOfElement(this.editor.$textContent, $element);
                }
                if (!$element || !$element.length) {
                    this.editor.$textContent.append($newLine);
                } else if (isBefore) {
                    $newLine.insertBefore($element);
                } else {
                    $newLine.insertAfter($element);
                }
                selectionHelper.moveInElement($newLine);
                this.editor.emitter.emit('sync');
            }

            deleteContents() {
                this.editor.focus(true);
                selectionHelper.deleteContents(this.editor.$textContent);
                this.editor.setLastRange(selectionHelper.getRange());
            }
        }

        return Injector;
    });
};
