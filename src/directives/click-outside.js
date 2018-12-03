module.exports = function (module) {
    module
        .directive('clickOutside', function ($document, $parse) {
            'ngInject';
            return {
                restrict: 'A',
                link: function ($scope, $el, $attr) {
                    const action = $parse($attr.clickOutside);

                    function handler(e) {
                        if ($el !== e.target && !$el[0].contains(e.target)) {
                            $scope.$apply(function () {
                                action($scope);
                            });
                        }
                    }

                    $document.on('click', handler);
                    $scope.$on('$destroy', function () {
                        $document.off('click', handler);
                    })
                }
            };
        });
};
