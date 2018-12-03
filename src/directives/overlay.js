module.exports = function (module) {
    module
        .directive('overlay', function ($parse) {
            'ngInject';

            function init($element) {
                let $overlay = angular.element('<div class="overlay-background dark-background hidden"></div>');
                $overlay
                    .appendTo($element.parent());
                return $overlay;
            }

            function toggle($overlay) {
                return value => {
                    if (value) {
                        $overlay.removeClass('hidden');
                    } else {
                        $overlay.addClass('hidden');
                    }
                }
            }

            return {
                restrict: 'A',
                require: {
                    dropdown: '^?uibDropdown'
                },
                link: function link($scope, $el, $attrs, {dropdown}) {
                    let $overlay = init($el);

                    if (dropdown) {
                        $scope.$watch(() => dropdown.isOpen(), toggle($overlay));
                        $overlay.click(() => dropdown.toggle(false));
                    } else if (angular.isDefined($attrs.popoverIsOpen)) {
                        let isOpen = $parse($attrs.popoverIsOpen);
                        $scope.$watch(isOpen, toggle($overlay));
                        $overlay.click(() => isOpen.assign($scope, false));
                    }

                    $scope.$on('$destroy', () => $overlay.remove());
                }
            };
        });
};
