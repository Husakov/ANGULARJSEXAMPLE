module.exports = class Controller {
    constructor(notifier, MessagingSettings, Admin, Team, $q) {
        'ngInject';

        this.notifier = notifier;

        this.model = MessagingSettings.get();

        this.assignTo = [];

        $q.all([Admin.allAdmins().$promise, Team.allTeams().$promise])
            .then((promises) => {
                let [admins, teams] = promises;
                this.assignTo.push.apply(this.assignTo, [...admins, ...teams]);
            });
    }

    updateModel() {
        this.model
            .$save()
            .then(() => {
                this.notifier.info('Your settings have been saved.');
            })
    }
};
