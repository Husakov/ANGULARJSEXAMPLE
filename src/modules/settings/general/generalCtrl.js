module.exports = class Controller {
    constructor(GeneralSettings, Profile, dialogs, notifier, TIME_ZONES) {
        'ngInject';

        this.resource = GeneralSettings;
        this.dialogs = dialogs;
        this.notifier = notifier;

        this.model = this.resource.get();

        this.timeZones = TIME_ZONES;
        this.Profile = Profile;
    }
    
    updateAppDetails() {
        this.model.$save()
            .then(() => {
                this.notifier.success('Your App settings have been updated');
            });
    }

    teammateAuthenticationGetterSetter(value) {
        let can_enable_enforce_sso = this.model.can_enable_enforce_sso && 1,
            force_2fa = this.model.force_2fa && 2,
            result;
        result = can_enable_enforce_sso + force_2fa;

        if (arguments.length > 0) {
            result = value;
            this.model.force_2fa = false;
            this.model.can_enable_enforce_sso = false;
            switch (value) {
                case 2:
                    this.model.force_2fa = true;
                    break;
                case 1:
                    this.model.can_enable_enforce_sso = true;
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    deleteApp() {
        this.dialogs
            .confirm({
                title: 'Delete ' + this.model.app_name + ' App',
                body: 'Are you ABSOLUTELY sure you want to delete this app?' +
                'Your subscription will be immediately cancelled and you will lose access to all data.',
                closeText: 'Delete App'
            })
            .then(() => {
                this.Profile.get()
                    .$promise
                    .then((currentUser) => {
                        return this.resource
                            .deleteApplication({id: currentUser.current_app_id})
                            .$promise;
                    })
                    .then(() => {
                        this.notifier.success('Your App was deleted');
                    });
            });
    }
};
