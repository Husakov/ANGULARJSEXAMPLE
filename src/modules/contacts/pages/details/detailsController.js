module.exports = function (module) {

    class Controller {
        constructor(contactsDetailsHelper, dialogs, moment, $interval, $stateParams, $scope, $state, pubSub) {
            'ngInject';
            this.contactsDetailsHelper = contactsDetailsHelper;
            this.dialogs = dialogs;
            this.moment = moment;
            this.$interval = $interval;
            this.$scope = $scope;
            this.$state = $state;

            this.mode = $stateParams.mode;

            this.isCompanies = this.mode === 'companies';
            this.isAdmins = this.mode === 'admins';
            this.isUsers = this.mode === 'users';

            this.loading = true;

            this.contact = contactsDetailsHelper.getContactData(this.mode);

            this.contact.$promise
                .then(() => {
                    this.loading = false;
                    this.coords = this.getCoords();
                    if (!this.isCompanies) {
                        this.setLocalTime();
                    }
                });

            this.activitySection = $state.params.section;

            this.$scope.$watch(() => this.activitySection, () => {
                $state.go('.', {
                    section: this.activitySection
                });
            });

            pubSub.onStateChanged(() => {
                this.activitySection = this.$state.params.section;
            }, $scope);
        }

        getCoords() {
            if (!this.contact) {
                return [];
            }

            if (this.isCompanies) {
                return _.pluck(this.contact.users, 'geoip_data');
            } else if (this.isAdmins) {
                return [this.contact.location_data];
            } else {
                return [this.contact.geoip_data];
            }
        }

        setLocalTime() {
            let timezone = this.coords[0].timezone,
                time = this.moment().tz(timezone);
            if (!timezone || !time) {
                this.localTime = 'Unknown';
                return;
            }
            this.localTime = time.format('h:mma');
            if (!this.localTimeInterval) {
                this.localTimeInterval = this.$interval(() => this.setLocalTime(), 60 * 1000);
                this.$scope.$on('$destroy', () => {
                    if (this.localTimeInterval) {
                        this.$interval.cancel(this.localTimeInterval);
                    }
                })
            }
        }

        openNotes() {
            this.dialogs.profileNotes(this.contact.id);
        }

        deleteContact() {
            let whom = this.isCompanies ? 'company' : 'person',
                options = {
                    title: `Delete ${whom}`,
                    body: `Are you sure about delete ${whom} and their conversation history?`
                };

            if (this.isCompanies) {
                options.body += '<br>Deleting a company is permanent. You won\'t be able to tag messages or segments with this company if you delete it.' +
                    '<br>Confirm you want to delete this company and their conversations.'
            }

            this.dialogs
                .confirm(options)
                .then(() => {
                    this.contactsDetailsHelper
                        .deleteContact(this.mode, this.contact.id)
                        .then(() => this.$state.go('contacts'));
                });
        }
    }

    module
        .controller('ContactsDetailsController', Controller);
};
