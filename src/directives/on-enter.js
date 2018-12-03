module.exports = function (module) {
    module
        .directive('onEnter', function ($parse) {
            'ngInject';
            const enterKey = 13;
            return {
                restrict: 'A',
                link: function ($scope, $el, $attr) {
                    const action = $parse($attr.onEnter);

                    function handler($e) {
                        if ($e.which === enterKey) {
                            $scope.$apply(function () {
                                action($scope);
                            });
                        }
                    }

                    $el.on('keypress', handler);
                    $scope.$on('$destroy', function () {
                        $el.off('keypress', handler);
                    })
                }
            };
        });
};
