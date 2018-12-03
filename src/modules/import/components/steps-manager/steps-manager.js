module.exports = function (module) {
    class Controller {
        constructor($scope, ImportStepWalker, importStateManager, $q) {
            'ngInject';
            this.$scope = $scope;
            this.StepWalker = ImportStepWalker;
            this.stepManager = importStateManager;
            this.$q = $q;
        }

        $onInit() {
            this.model = {};
            this.stepTemplates = this.stepComponents
                .map(c => _.kebabCase(c))
                .map(
                    (c, index) =>
                        `<${c} on-ready="$ctrl.walker.addStep(step, ${index})" model="$ctrl.model" index="${index + 1}" done="$ctrl.walker.next()"></${c}>`
                );
            this.total = this.stepTemplates.length;
            this.walker = new this.StepWalker(() => {
                this.setStepIndex();
            });

            let off = this.stepManager.on('state', ($e, [index]) => {
                let curIndex = this.walker.index + 1,
                    promise = this.$q.resolve(),
                    count = Math.abs(curIndex - index),
                    direction = index > curIndex ? 'next' : 'prev';
                for (let i = 0; i < count; i++) {
                    promise = promise.then(() => {
                        let curIndex = this.walker.index;
                        if (curIndex < 0 || curIndex >= this.total - 1 || !this.walker.steps[curIndex]) {
                            return this.$q.reject();
                        }
                        return this.walker[direction]();
                    });
                }
                promise
                    .catch(() => {
                        this.setStepIndex();
                    });
            });

            this.$onDestroy = () => {
                off();
                this.stepManager.stop();
            };

            this.stepManager.start();
        }

        setStepIndex() {
            this.stepIndex = this.walker.index + 1;
            this.stepManager.setStep(this.stepIndex);
        }

        finish() {
            this.walker
                .next()
                .then(() => {
                    this.done({$model: this.model});
                });
        }
    }

    module
        .component('importStepsManager', {
            templateUrl: require('./index.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                stepComponents: '=steps',
                done: '&'
            }
        });
};
