module.exports = function (mod) {

    mod.directive('textEditorNewLineFixer', function (textEditorSelectionHelper, textEditorElementsHelper) {
        'ngInject';

        const fixerClassName = textEditorElementsHelper.NEW_LINE_FIXER_CLASS;

        function isElementEmpty($element) {
            let html = $element.html();
            return html === '' || html === '<br>' || html === '</br>';
        }

        function check(editor) {
            let $container = editor.getTextContainer(),
                children = $container.children(),
                $last = children.last(),
                lastIsP = $last.is('p'),
                lastIsEmpty = isElementEmpty($last),
                lastHasClass = $last.hasClass(fixerClassName);
            children
                .not($last)
                .removeClass(fixerClassName);

            if (lastHasClass && (!lastIsEmpty || !lastIsP)) {
                $last.removeClass(fixerClassName);
                lastHasClass = false;
            } else if (!lastHasClass && lastIsEmpty && lastIsP) {
                $last.addClass(fixerClassName);
                lastHasClass = true;
            }

            if (!lastHasClass || !lastIsEmpty || !lastIsP) {
                $last = angular.element('<p><br></p>');
                $last.addClass(fixerClassName);
                $container.append($last);
            }
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
            link: function ($scope, $element, $attrs, { editor}) {
                let handler = getHandler(editor);
                textEditorSelectionHelper.on('change', handler, $scope);
            }
        };
    });
};
