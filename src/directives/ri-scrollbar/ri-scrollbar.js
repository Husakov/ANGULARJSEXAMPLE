module.exports = function (module) {
    require('./ri-scrollbar.scss');
    const templateUrl = require('./ri-scrollbar.html');

    module
        .directive('riScrollbar', function ($window) {
            'ngInject';
            class Controller {
                constructor($element, $scope) {
                    'ngInject';
                    this.$element = $element;
                    this.$scope = $scope;
                    this.$target = this.$element.find('> .ri-scrollbar-relative-wrapper > .ri-scrollbar-wrapper');
                    this.target = this.$target[0];
                    this.$scrollBar = this.$element.find('> .ri-scrollbar-container > .ri-scrollbar-rail > .ri-scrollbar');
                    this.scrollBarPercHeight = 0;
                    this.positionScrollBar = 0;
                }

                $onInit() {
                    this.observer = new MutationObserver(() => {
                        this.initScrollSize();
                    });

                    this.$scope.$watch('update', () => {
                        this.initScrollSize();
                    });

                    this.onResize = () => {
                        this.initScrollSize()
                    };

                    angular.element($window).on('resize', this.onResize);

                    this.observer.observe(this.target, {
                        attributes: true,
                        childList: true,
                        characterData: true,
                        subtree: true
                    });

                    this.$target.on('scroll', (element) => {
                        this.initScrollSize();
                        this.setPositionScrollbar(element);
                    });
                }

                $onDestroy() {
                    angular.element($window).off('resize', this.onResize);
                    this.observer.disconnect();
                }

                setPositionScrollbar(el) {
                    if (this.target.scrollHeight) {
                        this.positionScrollBar = el.target.scrollTop * 100 / this.target.scrollHeight;
                        this.$scrollBar.css('top', this.positionScrollBar + '%');
                    }
                }

                initScrollSize() {
                    if (this.target.scrollHeight) {
                        this.scrollBarPercHeight = this.target.clientHeight * 100 / this.target.scrollHeight;
                        this.$scrollBar.css('height', this.scrollBarPercHeight + '%');
                    }
                }

                isShowScrollbar() {
                    return this.target.clientHeight !== this.target.scrollHeight;
                }

                getScrollElement() {
                    return this.$target;
                }
            }

            return {
                restrict: 'A',
                transclude: true,
                scope: {},
                templateUrl: templateUrl,
                controller: Controller,
                controllerAs: '$ctrl'
            };
        })
}
