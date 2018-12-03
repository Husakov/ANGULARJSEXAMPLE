module.exports = function (module) {
    module
        .directive('recompile', function () {
            'ngInject';
            return {
                transclude: true,
                restrict: 'A',
                link: function link($scope, $el, $attrs, ctrls, $transclude) {
                    let previousElements,
                        previousScope;

                    compile();

                    function compile() {
                        $transclude($scope.$new(false, $scope), function (clone, clonedScope) {
                            previousElements = clone;
                            previousScope = clonedScope;
                            $el.append(clone);
                        });
                    }

                    function recompile() {
                        if (previousElements) {
                            previousElements.remove();
                            previousElements = null;
                            $el.empty();
                        }
                        if (previousScope) {
                            previousScope.$destroy();
                        }

                        compile();
                    }

                    $scope.$on('recompile', function () {
                        recompile();
                    });
                }
            };
        });
};
