module.exports = function (module) {
    require('./fixed-header.scss');

    function getTemplate(thead) {
        return `<div class="fixed-header-container"><table class="table fixed-header"><thead>${thead}</thead></table></div>`;
    }

    module
        .directive('fixedHeader', function ($compile, $window) {
            'ngInject';
            class Controller {
                constructor($element, $scope) {
                    'ngInject';
                    this.$element = $element;
                    this.$scope = $scope;
                    this.$window = angular.element($window);
                }

                setTemplate(theadTemplate) {
                    this.$fixedTableHead = $compile(getTemplate(theadTemplate))(this.$scope);
                    this.$element.parent().prepend(this.$fixedTableHead);
                }

                $onInit() {
                    this.observer = new MutationObserver(()=> {
                        this.updateCellsWidth();
                    });

                    this.observer.observe(this.$element[0], {
                        childList: true,
                        characterData: true,
                        subtree: true
                    });

                    this.updateCellsWidth = this.updateCellsWidth.bind(this);
                    this.$window.on('resize', this.updateCellsWidth);
                }

                updateCellsWidth() {
                    this.$headerCells = this.$element.find('thead th');
                    this.$fixedHeaderCells = this.$fixedTableHead.find('thead th');

                    this.$headerCells.each((index, cell) => {
                        let $fixedCell = angular.element(this.$fixedHeaderCells[index]);
                        let $cell = angular.element(cell);
                        $fixedCell.css({'width': $cell.outerWidth(), 'max-width': $cell.outerWidth()});
                    });
                }

                $onDestroy() {
                    this.observer.disconnect();
                    this.$window.off('resize', this.updateCellsWidth);
                }
            }
            return {
                restrict: 'A',
                controller: Controller,
                compile: ($element) => {
                    let templateThead = $element.find('thead').html();

                    return function($scope, $element, $attrs, $ctrl) {
                        $ctrl.setTemplate(templateThead);
                    }
                }
            };
        });
};
