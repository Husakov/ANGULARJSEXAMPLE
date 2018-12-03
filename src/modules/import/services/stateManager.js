module.exports = function (module) {
    module
        .factory('importStateManager', function ($state, $injector, pubSub) {
            'ngInject';
            const stepRegexp = /^(\d+)(-\d+)*$/;

            let nextStep = {},
                enabled = false;
            const redirect = _.debounce(function () {
                if (!enabled) {
                    return;
                }
                let steps = [];
                if (nextStep.step) {
                    steps.push(nextStep.step);
                } else {
                    let state = getState();
                    steps.push(stepRegexp.test(state) ? state.split('-')[0] : 1);
                }
                if (nextStep.subStep) {
                    steps.push(nextStep.subStep);
                }
                $state.go(`import.steps.step`, {step: steps.join('-')}, nextStep.options);
                nextStep = {};
            }, 100);

            function go(config) {
                angular.merge(nextStep, config);
                redirect();
            }

            function getState() {
                return $injector.get('$state').params.step;
            }

            return new class StateManager extends pubSub.EventEmitter {
                initState(state) {
                    if (!enabled) {
                        return;
                    }
                    if (!stepRegexp.test(state)) {
                        go({step: 1, replace: true});
                        return;
                    }
                    this.emit('state', state.split('-'));
                }

                setStep(index) {
                    go({step: index});
                }

                setSubStep(index) {
                    go({subStep: index});
                }

                start() {
                    enabled = true;
                    this.initState(getState());
                }

                stop() {
                    enabled = false;
                }
            }
        });
};
