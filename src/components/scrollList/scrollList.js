module.exports = function (module) {
    module
        .directive('scrollList', function (ScrollListHelper, $compile, $parse) {
            'ngInject';

            const RI_SCROLLBAR_KEY = 'ri-scrollbar';
            const RI_SCROLLBAR_SELECTOR = '.ri-scrollbar-wrapper';

            return {
                restrict: 'A',
                terminal: true,
                priority: 1000,
                compile: function compile($element, attrs) {
                    $element.attr('infinite-scroll', 'listHelper.loadMore()');
                    $element.attr('infinite-scroll-distance', '1');
                    $element.attr('infinite-scroll-disabled', '!listHelper.canFetch()');

                    if (attrs.scrollContainer) {
                        if (attrs.scrollContainer === RI_SCROLLBAR_KEY) {
                            $element.attr('infinite-scroll-container', 'riScrollContainer');
                        } else {
                            $element.attr('infinite-scroll-container', attrs.scrollContainer);
                        }
                    }

                    $element.removeAttr('scroll-list'); //remove the attribute to avoid indefinite loop
                    $element.removeAttr('data-scroll-list');
                    return {
                        post: function postLink($scope, $element, $attrs) {
                            let fetchInvoker = $parse($attrs.scrollList),
                                readyInvoker = $attrs.ready ? $parse($attrs.ready) : () => true,
                                ready = () => true,
                                listHelper = new ScrollListHelper({
                                    fetch(data) {
                                        return fetchInvoker($scope, data);
                                    },
                                    ready() {
                                        return readyInvoker($scope) && ready();
                                    }
                                });
                            if (attrs.scrollContainer === RI_SCROLLBAR_KEY) {
                                $scope.riScrollContainer = $element.parents(RI_SCROLLBAR_SELECTOR);
                                ready = () => {
                                    return $scope.riScrollContainer[0].offsetHeight > 0;
                                }
                            }
                            $scope.$on('scroll-list.reset', function () {
                                listHelper.resetItems();
                            });
                            $scope.listHelper = listHelper;
                            if ($attrs.helper) {
                                $parse($attrs.helper).assign($scope, listHelper);
                            }
                            $compile($element)($scope);
                            if (!listHelper.loading) {
                                listHelper.loadMore();
                            }
                        }
                    };
                }
            };
        });
};
