module.exports = function (module) {
    module.directive('scrollFix', function ($timeout) {
        'ngInject';

        return {
            restrict: 'A',
            require: '?^riScrollbar',
            link: function ($scope, $element, $attrs, riScrollbar) {
                let $scrollElement = riScrollbar ? riScrollbar.getScrollElement() : $element,
                    el = $scrollElement[0];

                function scrollBottom() {
                    $timeout(() => {
                        el.scrollTop = el.scrollHeight;
                    });
                }

                $scope.$on('scroll-down', function () {
                    scrollBottom();
                });
            }
        };
    });
};
