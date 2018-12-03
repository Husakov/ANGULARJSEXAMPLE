module.exports = function (mod) {

    mod.factory('textEditorHtmlFixer', function (emojis, textEditorSelectionHelper) {
        'ngInject';

        const selectionHelper = textEditorSelectionHelper;

        function replaceWith(el, tagName) {
            let wrap = tagName ? angular.element(`<${tagName}>`)[0] : document.createDocumentFragment();
            wrap.appendChildNodes(el.childNodes);
            el.replaceWith(wrap)
        }

        function prepareContainers($container) {
            $container.contents()
                .filter((i, el) => selectionHelper.isTextNode(el))
                .wrap('<p></p>');
            $container
                .children('br')
                .remove();
            $container
                .children('div,span')
                .each((i, el) => replaceWith(el, 'p'));
            $container
                .children(selectionHelper.baseTags)
                .find('br')
                .parent()
                .filter((i, el) => {
                    let $el = angular.element(el),
                        $childNodes = $el.contents();
                    return !$el.is(selectionHelper.baseTags) || !($childNodes.length === 1 && $childNodes.eq(0).is('br'));
                })
                .each((i, el) => {
                    let tagName = el.tagName.toLowerCase(),
                        beginTag = `<${tagName}>`,
                        endTag = `</${tagName}>`,
                        html = el.innerHTML,
                        newHtml = html.replace(/<br\/?>/g, endTag + beginTag);
                    if (html !== newHtml) {
                        angular.element(el)
                            .replaceWith(angular.element(beginTag + newHtml + endTag))
                    }
                });
            $container
                .children(selectionHelper.baseTags)
                .find('div')
                .each((i, el) => replaceWith(el))
        }

        function removeEmpty($container) {
            $container.children()
                .filter(selectionHelper.baseTags)
                .find(':empty')
                .filter(':not(br,img)')
                .remove();
            $container.children()
                .filter(selectionHelper.baseTags)
                .filter((i, el) => {
                    let contents = angular.element(el).contents();
                    return contents.length === 0
                        || contents.length === 1 && selectionHelper.isTextNode(contents[0]) && !contents.text();
                })
                .remove();
        }

        function checkEmptyContainer($container) {
            if ($container.children().length === 0) {
                $container.append('<p><br></p>');
            }
        }

        function emojisFixer($container) {
            let marker;
            $container
                .children('p')
                .each((i, el) => {
                    let $el = angular.element(el),
                        html = $el.html(),
                        resultHtml = emojis.toImage(html, 24);
                    if (html !== resultHtml) {
                        if (!marker) {
                            marker = selectionHelper.saveSelection();
                        }
                        html = $el.html();
                        resultHtml = emojis.toImage(html, 24);
                        $el.html(resultHtml);
                    }
                });
            if (marker) {
                marker.restore();
            }
        }

        function alignFixer($container) {
            const validAligns = ['left', 'center', 'right', 'justify'];
            $container
                .children('p')
                .each((i, el) => {
                    let $el = angular.element(el),
                        align = $el.css('text-align');
                    if (!validAligns.includes(align)) {
                        $el.css({'text-align': 'left'})
                    }
                });
        }

        const containerFixers = [prepareContainers, removeEmpty, alignFixer, checkEmptyContainer, emojisFixer];

        function deleteAction($container) {
            const action = 'keydown';
            const BackspaceKey = 8;
            const keys = [BackspaceKey, 46];

            function handler($event) {
                if (keys.includes($event.which)) {
                    if (selectionHelper.fixRemoveAction($container, $event.which === BackspaceKey)) {
                        $event.preventDefault();
                        $container.trigger(angular.element.Event('input', {}));
                    }
                }
            }

            $container.on(action, handler);
            return () => $container.off(action, handler);
        }

        function enterAction($container, editor) {
            const action = 'keydown';
            const enterKey = 13;
            const {newLineOnEnter, newLineOnShiftEnter} = editor.options;

            function handler($event) {
                if ($event.which === enterKey) {
                    if ($event.shiftKey && newLineOnShiftEnter) {
                        editor.injector.insertLine();
                    }
                    if (!newLineOnEnter || $event.shiftKey && newLineOnShiftEnter) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $container.trigger(angular.element.Event('keypress', {
                            which: enterKey,
                            shiftKey: $event.shiftKey
                        }));
                    }
                }
            }

            $container.on(action, handler);
            return () => $container.off(action, handler);
        }

        const actionFixers = [deleteAction, enterAction];

        class HtmlFixer {
            fixHtml($container) {
                containerFixers.forEach(f => f($container));
            }

            fixActions($container, editor) {
                let offs = actionFixers.map(f => f($container, editor));
                return () => offs.forEach(off => off());
            }
        }

        return new HtmlFixer();
    });
};
