module.exports = function (mod) {

    mod.directive('textEditorListsAutocomplete', function (textEditorSelectionHelper, textEditorElementsHelper) {
        'ngInject';

        const enteredListItemClass = textEditorElementsHelper.ENTERED_LIST_ITEM_CLASS;

        const listRegExps = {
            numberDots: /^\d+\../,           // 1.
            numberBrackets: /^\d+\)./,       // 1)
            stars: /^\*./,                  // *
            dashes: /^-./                   // -
        };

        function check(editor) {
            let nextListItem = '',
                $container = editor.getTextContainer(),
                children = $container.children();

            children.text(function (index, currentText) {
                for (let prop in listRegExps) {
                    if (listRegExps[prop].test(currentText) && !children.eq(index).hasClass(enteredListItemClass)) {
                        switch (prop) {
                            case 'numberDots':
                                nextListItem = (parseInt(currentText.match(listRegExps[prop])) + 1) + '.';
                                break;
                            case 'numberBrackets':
                                nextListItem = (parseInt(currentText.match(listRegExps[prop])) + 1) + ')';
                                break;
                            case 'stars':
                            case 'dashes':
                                nextListItem = currentText.match(listRegExps[prop]);
                        }

                        children.eq(index).addClass(enteredListItemClass);

                        return;
                    }
                }

                if (nextListItem.length) {
                    let modifiedText = nextListItem + currentText;
                    nextListItem = '';

                    return modifiedText;
                }
            });
        }

        function getHandler(editor) {
            return function (selection) {
                if (textEditorSelectionHelper.isSelectionInEditor(editor, selection)) {
                    check(editor);
                }
            };
        }

        return {
            restrict: 'A',
            require: {
                editor: '^textEditor'
            },
            link: function ($scope, $element, $attrs, {editor}) {
                let handler = getHandler(editor);
                textEditorSelectionHelper.on('enter', handler, $scope);
            }
        };
    });
};


