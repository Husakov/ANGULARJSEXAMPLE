module.exports = function (module) {

    class NavSections {
        constructor(messagesMediator, messagesActions, $state) {
            'ngInject';
            this.mediator = messagesMediator;
            this.messagesActions = messagesActions;
            this.$state = $state;

            this.items = [
                {
                    title: 'Settings',
                    icon: 'fa-cog',
                    sectionTemplateName: 'settings',
                    className: 'settings',
                    defaultActive: true
                },
                {
                    title: 'Actions',
                    icon: 'fa-paper-plane',
                    items: [
                        {
                            title: 'Preview message',
                            onEnter: () => {
                                this.mediator.model.optionsSet('preview_delivery_option', true);
                            },
                            onExit: () => {
                                this.mediator.model.optionsSet('preview_delivery_option', false);
                            },
                            isHidden: () => !this.mediator.model.options('isInApp')
                        },
                        {
                            title: 'View Report',
                            action: () => {
                                this.$state.go('^.report');
                            },
                            isHidden: () => !this.mediator.model.options('showReportsButton')
                        },
                        {
                            title: 'Send',
                            action: () => {
                                this.messagesActions
                                    .send(this.mediator.model, () => this.mediator.loading = true)
                                    .finally(() => this.mediator.loading = false);
                            },
                            isHidden: () => !this.mediator.model.options('showSendButton')
                        },
                        {
                            title: 'Duplicate',
                            action: () => {
                                this.messagesActions
                                    .duplicate(this.mediator.model, () => this.mediator.loading = true)
                                    .finally(() => this.mediator.loading = false);
                            },
                            isHidden: () => this.mediator.model.options('isNew')
                        },
                        {
                            title: 'Edit',
                            action: () => {
                                this.$state.go('^.^.edit', {model: this.mediator.model});
                            },
                            isHidden: () => !this.mediator.model.options('showEditButton'),
                            isDisabled: () => !this.mediator.model.options('enabledEditButton')
                        },
                        {
                            title: 'Delete',
                            action: () => {
                                this.messagesActions
                                    .delete(this.mediator.model, () => this.mediator.loading = true)
                                    .finally(() => this.mediator.loading = false);
                            },
                            isHidden: () => this.mediator.model.options('isNew')
                        }
                    ]
                }
            ];

            this.backButton = {
                title: 'Back to message',
                action: () => {
                    this.$state.go('messages.list.state', {
                        type: this.$state.params.type,
                        role: this.$state.params.role
                    });
                }
            }
        }

    }

    module
        .service('messagesDetailsNavSections', NavSections);
};
