module.exports = function (module) {
    class Controller {
        constructor($scope) {
            'ngInject';
            this.slides = [];
            this.step = 1;
            this.count = 0;

            $scope.$watch('$ctrl.step', () => this.validateStep());
        }

        register(slide) {
            this.slides.push(slide);
            this.count = this.slides.length;
        }

        validateStep() {
            if (!angular.isNumber(this.step)) {
                this.step = 1;
            }

            if (this.step > this.count) {
                this.step = this.count;
            }
            if (this.step < 1) {
                this.step = 1;
            }
        }
    }

    module
        .component('slides', {
            templateUrl: require('./index.html'),
            transclude: true,
            controller: Controller,
            bindings: {
                step: '=?'
            }
        });
};

