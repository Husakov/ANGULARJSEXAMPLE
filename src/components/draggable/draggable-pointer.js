module.exports = function (module) {

    module.directive('riDraggablePointer', function ($document) {
        'ngInject';
        return {
            restrict: 'AE',
            require: {
                $ctrl: '^riDraggable'
            },
            link: function ($scope, $element, $attrs, {$ctrl}) {
                $element.addClass('ri-draggable-pointer');
                if ($element.contents().length === 0) {
                    $element.addClass('ri-draggable-icon');
                }

                function start($e) {
                    if ($e.button === 0) {
                        $e.preventDefault();
                        $ctrl.startMove($e);

                        $document.on('mousemove', move);
                        $document.on('mouseup', stop);
                    }
                }

                function move($e) {
                    $ctrl.move($e);
                }

                function stop($e) {
                    $ctrl.stopMove($e);
                    $document.off('mousemove', move);
                    $document.off('mouseup', stop);
                }

                $element.on('mousedown', start);
            }
        };
    });
};
