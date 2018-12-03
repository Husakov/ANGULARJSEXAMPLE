let CommonController = require('../../settingsCommonCtrl');

module.exports = class Controller extends CommonController {
    constructor(notifier, $state, SettingsModel, $scope) {
        'ngInject';

        $scope.$watch(() => this.model.daily_summary_email_enabled, (value) => {
            if (!value) {
                this.model.daily_summary_new_user_list = false;
                this.model.daily_summary_new_companies_list = false;
            }
        });

        super(notifier, $state, SettingsModel);
    }

    daily_summary_email_enabled () {
        return !!this.model.daily_summary_email_enabled;
    }

};
