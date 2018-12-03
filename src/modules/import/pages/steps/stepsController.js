module.exports = function (module) {
    class Controller {
        constructor($state, importImportTypesHelper, importStateManager, notifier, pubSub, $scope, dialogs) {
            'ngInject';
            this.$state = $state;
            this.notifier = notifier;
            this.pubSub = pubSub;
            this.stateManager = importStateManager;
            this.dialogs = dialogs;

            this.type = $state.params.type;

            this.import = importImportTypesHelper.getType(this.type);
            this.pubSub.onStateChanged(() => this.stateManager.initState(this.$state.params.step), $scope);
            this.stateManager.initState(this.$state.params.step);
        }

        cancel() {
            this.dialogs
                .confirm({
                    title: 'Cancel import',
                    body: 'Are you sure you want to cancel your import?',
                    cancelText: 'No, continue',
                    closeText: 'Yes, cancel'
                })
                .then(() => {
                    this.$state.go('contacts');
                    this.notifier.warning('Your import was canceled')
                });
        }

        done() {
            this.$state.go('contacts');
            this.notifier.success('Your import successfully launched. You will receive email notification when it will be complete');
        }
    }

    module
        .controller('ImportStepsController', Controller);
};
