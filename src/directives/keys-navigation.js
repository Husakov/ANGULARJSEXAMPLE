/**
 *
 * keys-navigation - attribute directive for navigation through
 *                   the list of items using keyboard arrows (up, down) and enter button
 *
 * Usage example:
 *
 * <div keys-navigation="isActive">
 *     <div class="keys-navigation"> Target item 1 </div>
 *     <div> I want to skip this element. Do not add class 'keys-navigation'. </div>
 *     <a class="keys-navigation"> Target item 2 </a>
 *     <p class="keys-navigation"> Target item 3 </p>
 * </div>
 *
 * isActive - bool value for activate/deactivate navigation by keys.
 *
 * Usage for uib-dropdown:
 *
 * <div uib-dropdown
 *      is-open="isOpen"
 *      class="dropdown">
 *      <button class="btn btn-link dropdown-toggle"
 *              uib-dropdown-toggle>
 *              Open
 *              <span class="fa fa-chevron-down"></span>
 *      </button>
 *      <div class="dropdown-menu"
 *           uib-dropdown-menu
 *           keys-navigation="isOpen">
 *           <a class="keys-navigation"> Target item 1 </a>
 *           <a class="keys-navigation"> Target item 2 </a>
 *      </div>
 * </div>
 */


module.exports = function (module) {
    module
        .directive('keysNavigation', function ($document, $parse) {
            'ngInject';
            const enterKey = 13;
            const arrowUpKey = 38;
            const arrowDownKey = 40;
            const activeClassName = 'active-navigation-item';
            const navigationItemClassName = 'keys-navigation';

            function arrowsHandler($element, $activeChild, isUpDirection) {
                let $nextUpDownChild,
                    nextClass = `.${navigationItemClassName}:first`,
                    sideClass = `.${navigationItemClassName}:${isUpDirection ? 'last' : 'first'}`;

                if (!$activeChild) {
                    $nextUpDownChild = $element.find(sideClass);
                } else {
                    $activeChild.removeClass(activeClassName);
                    $nextUpDownChild = isUpDirection ? $activeChild.prevAll(nextClass) : $activeChild.nextAll(nextClass);

                    if (!$nextUpDownChild.length) {
                        $nextUpDownChild = $element.find(sideClass);
                    }
                }

                setActiveChild($nextUpDownChild, isUpDirection);
            }

            function enterHandler($activeChild) {
                if ($activeChild && $activeChild.length) {
                    $activeChild.trigger('click');
                }
            }

            function setActiveChild($activeChild, isUpDirection) {
                $activeChild.addClass(activeClassName)[0].scrollIntoViewIfNeeded(isUpDirection);

                if (isUpDirection) {
                    angular.element(window).scrollTop(0); // because height of body more then of view height (now we have overflow: hidden)
                }
            }


            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    const parsedIsActive = $parse($attr.keysNavigation);
                    function isActive() {
                        return parsedIsActive($scope);
                    }

                    $document.on('keydown', keyDownHandler);

                    $scope.$on('$destroy', function () {
                        $document.off('keydown', keyDownHandler);
                    });

                    function keyDownHandler(event) {
                        if (!isActive()) {
                            return;
                        }

                        const $alreadyActiveChild = $element.find(`.${activeClassName}.${navigationItemClassName}:first`);
                        const $activeChild = $alreadyActiveChild.length ? $alreadyActiveChild : null;

                        if (event.which === arrowUpKey) {
                            arrowsHandler($element, $activeChild, true);
                        }

                        if (event.which === arrowDownKey) {
                            arrowsHandler($element, $activeChild, false)
                        }

                        if (event.which === enterKey) {
                            enterHandler($activeChild)
                        }
                    }
                }
            };
        });
};
