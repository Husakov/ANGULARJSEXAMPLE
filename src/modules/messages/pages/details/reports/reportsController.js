module.exports = function (module) {

    class Controller {
        constructor(MessagesReportsHelper, slidePanelManager, Users, $state, pubSub, $scope, Export, notifier) {
            'ngInject';
            this.Users = Users;
            this.$scope = $scope;
            this.$state = $state;
            this.notifier = notifier;
            this.model = $scope.$ctrl.mediator.model;
            this.helper = new MessagesReportsHelper(this.model);
            this.messageId = $state.params.id;
            this.messageType = $state.params.type;
            this.userRole = $state.params.role;
            this.Export = Export;

            this.tagPanel = slidePanelManager.render({
                template: '<tag-search done="$ctrl.resolveTags({tags: tags})" existed="$ctrl.tags"></tag-search>',
                background: true,
                slideAppContainer: true,
                $scope: $scope.$new()
            });
            this.tagPanel.on('toggle', () => this.tags = []);

            this.setParams($state.params);

            pubSub.onStateChanged((e, state, params) => {
                this.setParams(params);
            }, $scope);

            this.filterByInverted = (section) => {
                return section.inverted === this.invertedReport;
            };
        }

        setParams({section, inverted}) {
            this.invertedReport = inverted;
            this.section = _.find(this.helper.sections, {id: section});
            this.$scope.$broadcast('scroll-list.reset');
        }

        fetch(params) {
            return this.helper.getUsers(this.section.id, params).$promise;
        }

        resolveTags({tags}) {
            let toAdd = _.map(tags, 'id'),
                options = {
                    included_ids: _.map(this.listHelper.checkedItems, 'user.id'),
                    tag_ids: toAdd,
                    action: 'add'
                };
            this.tagPanel.toggle();

            if (toAdd.length === 0) {
                return;
            }

            this.Users.bulk_tags(options);
        }

        toggleReport() {
            this.$state.go('^.section', {section: this.section.invertedId, inverted: this.invertedReport});
        }

        exportUsers() {
            const params = {
                query_type: 'message',
                action: this.section.id,
                new_message_id: this.messageId
            };

            this.loading = true;
            this.Export.csvExport({}, params).$promise
                .then(() => this.notifier.success('You will be emailed a CSV. At peak times this can take a few hours'))
                .catch(() => this.notifier.error('Error'))
                .finally(() => this.loading = false);
        }

        getUserIds() {
            if (this.listHelper.hasChecked) {
                return this.listHelper.checkedItems.map(item => item.user.id);
            }

            return null;
        }
    }

    module
        .controller('MessagesDetailsReportsController', Controller);
};
