module.exports = class Controller {
    constructor(notifier, Profile) {
        'ngInject';

        this.notifier = notifier;
        this.Profile = Profile;

        this.model = {};
    }

    updatePassword() {
        this.form.$setSubmitted();
        this.Profile.updatePassword(this.model)
            .$promise
            .then(() => {
                this.notifier.info('Your password were successfully updated.');
                this.model = {};
            })
            .catch((err) => {
                if (_.get(err, 'data.message')) {
                    this.notifier.error(err.data.message);
                }
            })
            .finally(() => {
                this.form.$setPristine();
                this.form.$setUntouched();
            });
    }
};
