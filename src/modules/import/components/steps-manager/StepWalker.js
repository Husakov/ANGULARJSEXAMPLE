module.exports = function (module) {
    module
        .factory('ImportStepWalker', function ($timeout, $q) {
            'ngInject';

            return class StepWalker {
                constructor(onStep) {
                    this.steps = [];
                    this.onStep = onStep;
                    this.index = 0;
                    this.inProgress = false;
                }

                addStep(step, index) {
                    this.steps[index] = step;
                    this.total = this.steps.length;
                    if (index === 0) {
                        this.step = this.steps[this.index];
                        this.step.init();
                    }
                }

                next() {
                    if (!this.step.validate()) {
                        return $q.reject();
                    } else {
                        this.setInProgress();
                        return $q.when(this.step.next())
                            .then(() => {
                                if (this.index < this.total - 1) {
                                    this.index += 1;
                                    this.initStep();
                                }
                                this.setInProgress(false);
                            });
                    }
                }

                skip() {
                    if (this.step.required) {
                        return $q.reject();
                    } else {
                        this.index += 1;
                        this.initStep();
                        return $q.resolve();
                    }
                }

                prev() {
                    if (this.index > 0) {
                        this.index -= 1;
                        this.initStep();
                    }
                    return $q.resolve();
                }

                setInProgress(state = true) {
                    if (state) {
                        this.timeout = $timeout(() => {
                            this.inProgress = true;
                            $timeout.cancel(this.timeout);
                            this.timeout = null;
                        }, 200);
                    } else {
                        if (this.timeout) {
                            $timeout.cancel(this.timeout);
                            this.timeout = null;
                        }
                        this.inProgress = false;
                    }
                }

                initStep() {
                    this.step = this.steps[this.index];
                    this.step.init();
                    this.onStep();
                }
            }
        });
};
