module.exports = function (module) {
    class Controller {
        constructor($element, $scope, $compile, $templateCache) {
            'ngInject';
            this.$element = $element;
            this.$scope = $scope;
            this.$compile = $compile;
            this.$templateCache = $templateCache;
        }

        $onInit() {
            if (this.template) {
                this.insertTemplate(this.template);
            }
            if (this.templateUrl) {
                this.insertTemplate(this.$templateCache.get(this.templateUrl))
            }
            this.slides.register(this);
        }

        insertTemplate(template) {
            const container = angular.element('<div class="wrapper"></div>');
            container.html(template);
            this.$compile(container)(this.$scope.$parent);
            this.$element.empty();
            this.$element.append(container);
        }
    }

    module
        .component('slide', {
            controller: Controller,
            require: {
                slides: '^slides'
            },
            bindings: {
                template: '=?',
                templateUrl: '=?'
            }
        });
};

