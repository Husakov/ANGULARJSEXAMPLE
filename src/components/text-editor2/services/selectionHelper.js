module.exports = function (mod) {

    const rangy = require('rangy/lib/rangy-selectionsaverestore');

    mod.factory('textEditorSelectionHelper', function ($document) {
        'ngInject';

        class SelectionHelper {
            constructor() {
                this.baseTags = 'p,h1,h2';
            }

            getSelection() {
                return rangy.getSelection();
            }

            getRange(selection = this.getSelection()) {
                return selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            }

            setRange(range) {
                this.getSelection().setSingleRange(range);
            }

            moveToElement($element) {
                let selection = this.getSelection(),
                    range = rangy.createRange();
                range.setStartBefore($element[0]);
                selection.setSingleRange(range);
            }

            getRangeInElement($element, toEnd = false) {
                let range = rangy.createRange(),
                    position;
                range.selectNodeContents($element[0]);
                position = toEnd ? range.endOffset : range.startOffset;
                range.setStart($element[0], position);
                range.setEnd($element[0], position);
                return range;
            }

            moveInElement($element, toEnd = false) {
                let selection = this.getSelection();
                selection.setSingleRange(this.getRangeInElement($element, toEnd));
            }

            isIn(selection, $element) {
                let range = this.getRange(selection);
                return range && this.isInTree(angular.element(range.startContainer), $element) && this.isInTree(angular.element(range.endContainer), $element);
            }

            getSelectedRect(selection = this.getSelection()) {
                let range = this.getRange(selection),
                    selectionRects = range.nativeRange.getClientRects(),
                    scrollTop = angular.element($document).scrollTop();

                return {
                    left: _.min(_.pluck(selectionRects, 'left')),
                    right: _.max(_.pluck(selectionRects, 'right')),
                    top: _.min(_.pluck(selectionRects, 'top')) + scrollTop,
                    bottom: _.min(_.pluck(selectionRects, 'bottom')) + scrollTop
                };
            }

            isInTree($element, parent) {
                if (!$element || !$element.length) {
                    return;
                }
                if ($element.length > 1) {
                    return !_.some($element, el => !this.isInTree(angular.element(el), parent));
                }
                let $parent = $element;
                while ($parent && $parent.length > 0) {
                    if ($parent.is(parent)) {
                        return true;
                    }
                    $parent = $parent.parent();
                }
                return false;
            }

            hasValidText(selection = this.getSelection()) {
                let html = selection.toHtml();
                html = html.replace(/<te-[^>]*<\/te-[^>]*>/g, '');
                return html.length > 0;
            }

            getSelectionContainer(selection = this.getSelection()) {
                if (!selection) {
                    return;
                }
                return this.getRangeContainer(this.getRange(selection));
            }

            getRangeContainer(range = this.getRange()) {
                if (!range) {
                    return;
                }
                let container = range.commonAncestorContainer;

                if (this.isTextNode(container)) {
                    container = container.parentNode;
                }

                if (container.parentNode === range.startContainer || container.parentNode === range.endContainer) {
                    container = container.parentNode;
                }

                return angular.element(container);
            }

            getTopNodeOfElement($rootNode, $element) {
                let el = rangy.dom.getClosestAncestorIn($element[0], $rootNode[0], true);
                if (el) {
                    return angular.element(el);
                }
                if (this.isInTree($element, $rootNode) && $element.parent().is($rootNode)) {
                    return $element;
                }
                return null;
            }

            getTopNodeOfRange($rootNode, range = this.getRange()) {
                let $cont = this.getRangeContainer(range);
                return this.getTopNodeOfElement($rootNode, $cont);
            }

            getTopNodesOfRange($rootNode, range = this.getRange()) {
                if (!range || !$rootNode) {
                    return null;
                }
                let $startCont = this.getTopNodeOfElement($rootNode, angular.element(range.startContainer)),
                    $endCont = this.getTopNodeOfElement($rootNode, angular.element(range.endContainer));
                if ($startCont && $startCont.length && $endCont && $endCont.length) {
                    let startIndex = -1,
                        endIndex = -1;
                    return $rootNode
                        .children()
                        .filter((i, el) => {
                            if (endIndex !== -1) {
                                return false;
                            }
                            if ($endCont.is(el)) {
                                endIndex = i;
                            }
                            if (startIndex === -1) {
                                if ($startCont.is(el)) {
                                    startIndex = i;
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                            return true;
                        });
                }
                return angular.element();
            }

            getValidTopNodesOfRange($rootNode, range = this.getRange()) {
                let $directChildren = this.getTopNodesOfRange($rootNode, range);
                if (!$directChildren || $directChildren.length === 0) {
                    return false;
                }
                return $directChildren.filter(this.baseTags);
            }

            wrapSelection($node, selection = this.getSelection()) {
                let range = this.getRange(selection);
                if (selection.isCollapsed) {
                    range.insertNode($node[0]);
                } else if (range.canSurroundContents()) {
                    range.surroundContents($node[0]);
                }
            }

            clearSelection(selection = this.getSelection()) {
                selection.removeAllRanges();
            }

            insertNode($rootNode, $elements, isOnTop = false) {
                let range = this.getRange();
                this.deleteContents($rootNode);
                if (isOnTop) {
                    this.split($rootNode);
                }
                range = this.getRange();
                $elements
                    .get()
                    .reverse()
                    .forEach(element => range.insertNode(element));
            }

            deleteContents($rootNode) {
                this.setValidRangeBoundaries($rootNode);
                let savedSelection = this.saveSelection(),
                    $directChildren = this.getTopNodesOfRange($rootNode),
                    range;
                $directChildren
                    .not(this.baseTags)
                    .remove();
                savedSelection.restore();
                if (!this.getSelection().isCollapsed) {
                    $document[0].execCommand('delete');
                }
                $directChildren = this.getTopNodesOfRange($rootNode);
                if ($directChildren.length > 1) {
                    savedSelection = this.saveSelection();
                    range = rangy.createRange();
                    range.setStart($directChildren[1], 0);
                    range.setEnd($directChildren[1], $directChildren[1].childNodes.length);
                    $directChildren.eq(0).append(range.extractContents());
                    $directChildren.eq(1).remove();
                    savedSelection.restore();
                }
            }

            split($rootNode) {
                let selection = this.getSelection(),
                    range = this.getRange(selection),
                    $directChild = this.getTopNodesOfRange($rootNode, range),
                    parentOffset,
                    leftRange;

                if (!$directChild || $directChild.length === 0) {
                    return;
                }

                if ($directChild.length > 1) {
                    range = rangy.createRange();
                    range.setStartAfter($directChild[0]);
                    range.setEndAfter($directChild[0]);
                    selection.setSingleRange(range);
                    return;
                }

                let notBrChildren = $directChild.contents().filter((i, el) => !angular.element(el).is('br'));
                if (notBrChildren.length === 0) {
                    range = rangy.createRange();
                    if ($rootNode.children().length > 1) {
                        let $sibling = $directChild.next();
                        if ($sibling.length > 0) {
                            $directChild.remove();
                            range.setStartBefore($sibling[0]);
                            range.setEndBefore($sibling[0]);
                        } else {
                            $sibling = $directChild.prev();
                            $directChild.remove();
                            range.setStartAfter($sibling[0]);
                            range.setEndAfter($sibling[0]);
                        }
                    } else {
                        $directChild.remove();
                        range.selectNodeContents($rootNode[0]);
                    }
                } else {
                    parentOffset = rangy.dom.getNodeIndex($directChild[0]);
                    leftRange = rangy.createRange();
                    leftRange.setStart($rootNode[0], parentOffset);
                    leftRange.setEnd(range.startContainer, range.startOffset);
                    angular.element(leftRange.extractContents()).insertBefore($directChild);

                    range = rangy.createRange();
                    range.setStartBefore($directChild[0]);
                    range.setEndBefore($directChild[0]);
                    selection.setSingleRange(range);
                }

            }

            validateRange($rootNode, range) {
                let $directChildren = this.getTopNodesOfRange($rootNode, range);

                if (!$directChildren || $directChildren.length === 0) {
                    return null;
                }

                if (_.some($directChildren, el => !angular.element(el).is(this.baseTags))) {
                    return null;
                }

                this.setCorrectSelectionStart($rootNode, range);
                return range;
            }

            focus($rootNode, range, validRange, insertLine) {
                if (validRange) {
                    this.setRange(validRange);
                    return;
                }
                if (range) {
                    let $cont = this.getTopNodesOfRange($rootNode, range).last();
                    insertLine($cont);
                    return;
                }
                let $last = $rootNode.children(':last');
                if ($last.is(this.baseTags)) {
                    this.moveInElement($last, true);
                    return;
                }
                if ($last.length) {
                    insertLine($last);
                    return;
                }
                insertLine();
            }

            saveSelection() {
                let marker = rangy.saveSelection();
                return {
                    restore() {
                        rangy.restoreSelection(marker);
                    },
                    clear() {
                        rangy.removeMarkers(marker);
                    }
                };
            }

            fixRemoveAction($rootNode, toLeft = true) {
                let selection = this.getSelection();
                if (!selection.isCollapsed || !selection.rangeCount) {
                    return false;
                }

                let curRange = this.getRange(selection),
                    element = curRange.commonAncestorContainer;
                if (this.isTextNode(element)) {
                    let range = rangy.createRange(),
                        curOffset = curRange.startOffset;
                    range.selectNodeContents(element);
                    if (toLeft && curOffset > 0 || !toLeft && curOffset < range.endOffset) {
                        return false;
                    }
                }

                if (angular.element(element).is(this.baseTags)) {
                    return false;
                }

                let siblingProp = toLeft ? 'previousSibling' : 'nextSibling';

                while (!$rootNode.is(element)) {
                    let $sib = angular.element(element[siblingProp]);
                    if ($sib.length) {
                        if ($sib.attr('contenteditable') === 'false') {
                            $sib.remove();
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        element = element.parentNode;
                    }
                }
                return false;
            }

            doOnValidRanges($rootNode, action) {
                let ranges = [],
                    savedSelection = this.saveSelection(),
                    originalRange = this.getRange(),
                    $directChildren = this.getTopNodesOfRange($rootNode, originalRange),
                    range;

                if (!$directChildren || $directChildren.length === 0) {
                    return null;
                }

                for (let i = 0; i < $directChildren.length; i += 1) {
                    let $el = $directChildren.eq(i);
                    if ($el.is(this.baseTags)) {
                        if (!range) {
                            range = rangy.createRange();
                            if (i === 0) {
                                range.setStart(originalRange.startContainer, originalRange.startOffset);
                            } else {
                                range.setStart($el[0], 0);
                            }
                        }
                        if (i === $directChildren.length - 1) {
                            range.setEnd(originalRange.endContainer, originalRange.endOffset);
                            ranges.push(range);
                        } else {
                            range.setEnd($el[0], $el[0].childNodes.length);
                        }
                    } else {
                        if (range) {
                            ranges.push(range);
                        }
                        range = null;
                    }
                }

                if (ranges.length) {
                    let s = this.getSelection();
                    ranges.forEach(r => this.setCorrectSelectionStart($rootNode, r));
                    ranges.forEach(r => {
                        s.setSingleRange(r);
                        action();
                    });
                    savedSelection.restore();
                    savedSelection = null;
                }
                if (savedSelection) {
                    savedSelection.clear();
                }
            }

            isTextNode(el) {
                el = el[0] || el;
                return el.nodeType === 3
            }

            isEndOfNode(el, offset) {
                if (this.isTextNode(el)) {
                    return offset === el.length;
                } else {
                    return offset === el.childNodes.length;
                }
            }

            setCorrectSelectionStart($rootNode, range) {
                let startCont = range.startContainer,
                    offset = range.startOffset;
                while (this.isEndOfNode(startCont, offset) && !$rootNode.is(startCont.parentNode)) {
                    startCont = startCont.parentNode;
                    offset = rangy.dom.getNodeIndex(startCont) + 1;
                }

                if (!$rootNode.is(startCont.parentNode) || !this.isEndOfNode(startCont, offset)) {
                    return;
                }

                if (angular.element(startCont.nextSibling).is(this.baseTags)) {
                    startCont = startCont.nextSibling;
                    range.setStart(startCont, 0);
                }
            }

            setValidRangeBoundaries($rootNode) {
                let range = this.getRange(),
                    $directChildren = this.getTopNodesOfRange($rootNode, range),
                    $startChild = $directChildren.first(),
                    $endChild = $directChildren.last(),
                    shouldUpdate = false;
                if (!$startChild.is(this.baseTags)) {
                    let $prev = $startChild.prev();
                    if ($prev && $prev.length && $prev.is(this.baseTags)) {
                        range.setStart($prev[0], $prev[0].childNodes.length);
                    } else {
                        range.setStartBefore($startChild[0]);
                    }
                    shouldUpdate = true;
                }
                if (!$endChild.is(this.baseTags)) {
                    let $next = $endChild.next();
                    if ($next && $next.length && $next.is(this.baseTags)) {
                        range.setEnd($next[0], 0);
                    } else {
                        range.setEndAfter($endChild[0]);
                    }
                    shouldUpdate = true;
                }
                if (shouldUpdate) {
                    this.setRange(range);
                }
            }
        }

        return new SelectionHelper();
    });
};
