module.exports = function (module) {
    const rangy = require('rangy');

    module
        .factory('textEditorSelectionHelper', function (textEditorManager, pubSub, $document, $timeout) {
            'ngInject';

            const emiter = new pubSub.EventEmitter();

            function getSelection() {
                let selection = rangy.getSelection();
                return {
                    selection,
                    range: selection.rangeCount > 0 ? selection.getRangeAt(0) : null,
                    text: selection.toString()
                };
            }

            function isInEditor(name, element) {
                let editor = angular.isString(name) ? textEditorManager.getEditor(name, true) : name,
                    container = editor && editor.getTextContainer();

                if (!container || !element) {
                    return false;
                }

                return _.some(angular.element(element).parents(), parent => angular.element(parent).is(container));
            }

            $document.on('keydown', $e => {
                emiter.emit('keydown', $e);
            });

            $document.on('keypress', $e => {
                if ($e.which === 13) {
                    $timeout(() => {
                        emiter.emit('enter', getSelection());
                    });
                }
            });

            $document.on('mouseup keydown paste', () => {
                $timeout(() => {
                    emiter.emit('change', getSelection());
                });
            });

            function getSelectedPath() {
                let sel = getSelection(),
                    selected = sel.selection.anchorNode,
                    path = [],
                    endOffset;
                if (!_.isNull(selected)) {
                    let i,
                        ce = selected.contentEditable;
                    while (selected !== null && ce !== 'true') {
                        i = rangy.dom.getNodeIndex(selected);
                        path.push(i);
                        selected = selected.parentNode;
                        if (!_.isNull(selected)) {
                            ce = selected.contentEditable;
                        }
                    }
                    path.reverse();

                    endOffset = sel.range.endOffset;
                    return {
                        targetElement: selected,
                        path: path,
                        endOffset: endOffset
                    };
                }
            }

            function selectPath({targetElement, path, startOffset, endOffset}) {
                let elem = targetElement,
                    sel = rangy.getSelection(),
                    offset = endOffset,
                    range;
                if (path) {
                    for (let i = 0, len = path.length; i < len; i++) {
                        elem = elem.childNodes[path[i]];
                        if (elem === undefined) {
                            return;
                        }
                        while (elem.length < offset) {
                            offset -= elem.length;
                            elem = elem.nextSibling;
                        }
                        if (elem.childNodes.length === 0 && !elem.length) {
                            elem = elem.previousSibling;
                        }
                    }
                }

                range = rangy.createRange();
                range.setStart(elem, startOffset);
                range.setEnd(elem, endOffset);
                sel.setSingleRange(range);
            }

            function splitNode(range, insertNode) {
                let {path, targetElement} = getSelectedPath(),
                    container = targetElement,
                    topNode;

                if (path.length > 0) {
                    let parentOffset,
                        leftRange;
                    topNode = container.childNodes[path[0]];
                    parentOffset = rangy.dom.getNodeIndex(topNode);
                    leftRange = rangy.createRange();
                    leftRange.setStart(container, parentOffset);
                    leftRange.setEnd(range.startContainer, range.startOffset);
                    container.insertBefore(leftRange.extractContents(), topNode);
                }
                if (insertNode) {
                    if (path.length > 0) {
                        container.insertBefore(insertNode, topNode);
                    } else {
                        range.insertNode(insertNode);
                    }
                }
            }

            class SelectionHelper {
                constructor() {
                    textEditorManager.setSelectionHelper(this);
                }

                getSelection() {
                    return getSelection();
                }

                getSelectedRect() {
                    let selectionRects = rangy.getSelection().getRangeAt(0).nativeRange.getClientRects(),
                        scrollTop = angular.element($document).scrollTop();

                    return {
                        left: _.min(_.pluck(selectionRects, 'left')),
                        right: _.max(_.pluck(selectionRects, 'right')),
                        top: _.min(_.pluck(selectionRects, 'top')) + scrollTop,
                        bottom: _.min(_.pluck(selectionRects, 'bottom')) + scrollTop
                    };
                }

                isSelectionInEditor(name, selection) {
                    return selection && selection.range && isInEditor(name, selection.range.startContainer) && isInEditor(name, selection.range.endContainer);
                }

                on(eventName, handler, $scope) {
                    return emiter.on(eventName, (e, ...args) => handler(...args), $scope);
                }

                getMentionSearchText(selection, triggerChar) {
                    let range = selection.range,
                        text = range.endContainer.textContent.substring(0, range.endOffset),
                        index = text.lastIndexOf(triggerChar);

                    if ((selection.selection.isCollapsed) && index >= 0) {
                        let path = getSelectedPath();
                        path.startOffset = index;
                        return {
                            select: function () {
                                selectPath(path);
                            },
                            text: text.substring(index + triggerChar.length)
                        };
                    } else {
                        return null;
                    }
                }

                wrapSelection(node) {
                    let selection = getSelection();
                    if (selection.selection.isCollapsed) {
                        selection.range.insertNode(node);
                    } else if (selection.range.canSurroundContents()) {
                        selection.range.surroundContents(node);
                    }
                }

                insertNode(node, isTop = false) {
                    let selection = getSelection();
                    if (!selection.selection.isCollapsed) {
                        selection.range.deleteContents();
                    }
                    selection = getSelection();
                    if (isTop) {
                        splitNode(selection.range, node);
                    } else {
                        selection.range.insertNode(node);
                    }
                }

                saveSelection() {
                    let savedSelection = rangy.saveSelection();

                    return {
                        restore() {
                            rangy.restoreSelection(savedSelection);
                        },
                        restoreAndMoveToEnd() {
                            rangy.restoreSelection(savedSelection);
                            let selection = getSelection(),
                                sel = selection.selection,
                                range = selection.range;
                            range.setStart(range.endContainer, range.endOffset);
                            sel.setSingleRange(range);
                        }
                    };
                }
            }

            return new SelectionHelper();
        });
};
