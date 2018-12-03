module.exports = function (module) {

    class Mediator {
        constructor(MessagesMessageModel, dialogs, notifier, $state, Admin, Team) {
            'ngInject';
            this.MessagesMessageModel = MessagesMessageModel;
            this.$state = $state;
            this.dialogs = dialogs;
            this.notifier = notifier;
            this.loading = true;

            this.assignArray = [];

            Admin.query().$promise.then(items => this.assignArray.push(...items));
            Team.query().$promise.then(items => this.assignArray.push(...items));
        }

        init() {
            this.isFilterOpened = false;
            this.isMobilePreview = false;
            this.isDesktopPreview = false;

            let isNew = this.$state.current.name.includes('new'),
                params = this.$state.params;

            if (!isNew) {
                if (params.model) {
                    this.model = params.model
                } else if (params.id) {
                    this.model = new this.MessagesMessageModel({id: params.id});
                }
            } else {
                this.model = new this.MessagesMessageModel(params.message || {
                    message_type: params.type,
                    user_role: params.role
                });
            }

            if (params.userIds) {
                this.model.set('selection_state.included_ids', params.userIds);
            }

            this.loading = true;
            this.model
                .$promise
                .then(() => {
                    this.loading = false;
                });
        }

        toggleLive(versionIndex = 0, state = !this.model.options('isLive', true, versionIndex)) {
            this.model.$setLive(versionIndex, state);
        }

        toggleFilter(state = !this.isFilterOpened) {
            this.isFilterOpened = state;
        }

        togglePreviewMode(state = false) {
            this.isMobilePreview = state === 'mobile';
            this.isDesktopPreview = state === 'desktop';
            this.isPreview = !!state;
        }

        getAssign(id) {
            return _.find(this.assignArray, item => item.id === id);
        }

        getOptionTabStatus(tabAlias) {
            let enabled;
            switch (tabAlias) {
                case 'stopdate':
                    enabled = this.model.get('stopped_at');
                    break;
                case 'goal':
                    enabled = this.model.get('message_goal.predicates.size');
                    break;
                case 'schedule':
                    enabled = this.model.get('send_at');
                    break;
                case 'deliveryChanel':
                    enabled = this.model.get('delivery_channel');
                    break;
                case 'target':
                    enabled = (this.model.get('target_match') && this.mediator.model.get('target_match') !== '');
                    break;
                case 'deliveryWindow':
                    enabled = this.model.get('delivery_window.start_time');
                    break;
                case 'unsubscribe':
                    enabled = this.model.get('show_unsubscribe_link');
                    break;
                default:
                    enabled = false;
                    break;
            }
            return enabled;
        }

        deleteVersion(versionIndex = 0) {
            this.dialogs
                .confirm({
                    title: 'Delete Version',
                    body: `Are you sure you want to delete version?`,
                    closeText: 'Delete'
                })
                .then(() => {
                    return this.model.$deleteVersion(versionIndex);
                })
                .then(() => {
                    this.notifier.success('Version was successfully deleted!');
                });
        }

        getAssignName(id, emptyText = 'Please Select') {
            if (!id) {
                return emptyText;
            }
            let assign = this.getAssign(id);
            return assign ? assign.name : emptyText;
        }

        destroy() {
            this.model = null;
        }
    }

    module
        .service('messagesMediator', Mediator);
};
