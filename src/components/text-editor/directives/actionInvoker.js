module.exports = function (mod) {
    const rangy = require('rangy');

    mod.directive('textEditorActionInvoker', function (textEditorSelectionHelper, $document, $timeout) {
        'ngInject';

        function getWrapper($element) {
            return $element.parents('.action-wrapper');
        }

        function invoke($el, action) {
            $el[action]()
        }

        function onKeyDown($e) {
            let $el = angular.element($e.target);
            switch ($e.keyCode) {
                //moving out up
                case 33:
                case 36:
                case 37:
                case 38:
                    moveUp($el);
                    break;
                //moving out down
                case 34:
                case 35:
                case 39:
                case 40:
                    moveDown($el);
                    break;
                //deleting element
                case 8:
                case 46:
                    getWrapper($el).remove();
                    break;
                //enter
                case 13:
                    $e.preventDefault();
                    select(insertLine(getWrapper($el)));
                    break;
                default:
                    break;
            }
        }

        function moveUp($el) {
            select(getWrapper($el).find('.action-trap'));
        }

        function moveDown($el) {
            let $wrapper = getWrapper($el),
                $next = $wrapper.next();
            if ($next.size() === 0) {
                insertLine($wrapper);
            } else if ($next.prop('tagName') === 'P' && $next.contents().size() === 0) {
                $next.append('<br>');
            }

            select(getWrapper($el).find('.action-after-trap'));
        }

        function select($element) {
            let newRange = rangy.createRange();
            newRange.setStart($element[0], 0);
            newRange.setEnd($element[0], 0);
            rangy.getSelection().setSingleRange(newRange);
        }

        function insertLine($element, isBefore = false) {
            let $line = angular.element('<p><br></p>');
            if (isBefore) {
                $element.before($line);
            } else {
                $element.after($line);
            }
            return $line;
        }

        function checkSelection(selection) {
            let selected = selection.selection.anchorNode,
                $selected = angular.element(selected),
                isTrap = $selected.hasClass('action-trap'),
                isTrapAfter = $selected.hasClass('action-after-trap');
            if (isTrap || isTrapAfter) {
                let $el = getWrapper($selected).find('.action-element');
                if (!$el.hasClass('skip-action')) {
                    invoke($el, 'focus');
                    invoke($el, 'click');
                } else {
                    let $wrapper = getWrapper($el),
                        $next = $wrapper.next();
                    if (isTrap) {
                        select($next);
                    } else {
                        let $prev = $wrapper.prev();
                        if ($prev.length) {
                            select($prev);
                        } else {
                            select($next);
                        }
                    }
                }
            }
        }

        $document.on('keydown', 'text-editor .action-wrapper', onKeyDown);

        function addHandlers($element, hadler) {
            $element
                .find('.action-trap, .action-after-trap')
                .off('mousedown', hadler)
                .on('mousedown', hadler);
        }

        function getTrapHandler(editor) {
            return function ($e) {
                let $target = angular.element($e.target);
                $e.preventDefault();
                $e.stopPropagation();
                select(insertLine(getWrapper($target), $target.hasClass('action-trap')));

                editor.$editor.scope.updateTaBindtaTextElement();
                return false;
            };
        }

        return {
            restrict: 'A',
            require: {
                editor: '^textEditor',
                ngModel: '^ngModel'
            },
            link: function ($scope, $element, $attrs, {ngModel, editor}) {
                let trapHandler = getTrapHandler(editor);
                textEditorSelectionHelper.on('change', checkSelection, $scope);
                $timeout(() => {
                    addHandlers($element, trapHandler);
                }, 100);
                $scope.$watch(() => ngModel.$viewValue, () => {
                    addHandlers($element, trapHandler)
                });
            }
        };
    });
};
