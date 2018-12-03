module.exports = class Controller {
    constructor(notifier, $state, SettingsModel) {
        'ngInject';

        this.notifier = notifier;

        this.model = new SettingsModel($state.current.data.modelKey);
    }

    updateModel() {
        return this.model
            .$save()
            .then(() => {
                this.notifier.info('Your settings have been saved.');
            })
    }
};
