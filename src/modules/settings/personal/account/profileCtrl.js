let CommonController = require('../../settingsCommonCtrl');

module.exports = class Controller extends CommonController {
    constructor(notifier, $state, SettingsModel, Profile, $q) {
        'ngInject';
        super(notifier, $state, SettingsModel);

        this.Profile = Profile;
        this.$q = $q;
    }

    addFile(file, content) {
        this.model.avatar.image_url = content;
        this.newAvatar = file;
    }

    updateModel() {
        if (this.newAvatar) {
            this.Profile.uploadAvatar(this.newAvatar);
        }

        let promise = this.$q.resolve();

        this.form.$setSubmitted();

        if (this.form.userEmail.$dirty) {
            promise = this.Profile
                .changeEmail(_.pick(this.model, ['current_password', 'email']))
                .$promise;
        }

        promise
            .then(() => {
                return super.updateModel();
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
