module.exports = function (module) {


    class NavSections {
        constructor(messagesMediator, messagesActions, $state) {
            'ngInject';
            this.mediator = messagesMediator;
            this.$state = $state;
            this.items = [
                {
                    title: 'Edit',
                    icon: 'fa-sliders',
                    items: [
                        {
                            title: 'Experience',
                            className: 'edit-experience',
                            sectionTemplateName: 'experience'
                        },
                        {
                            title: 'Style',
                            className: 'edit-style radio-select',
                            sectionTemplateName: 'style'
                        }
                    ]
                },
                {
                    title: 'Preview',
                    icon: 'fa-desktop',
                    onExit: () => this.mediator.togglePreviewMode(),
                    items: [
                        {
                            title: 'Desktop',
                            action: () => {
                                this.mediator.togglePreviewMode('desktop')
                            }
                        },
                        {
                            title: 'Mobile',
                            action: () => {
                                this.mediator.togglePreviewMode('mobile')
                            }
                        }
                    ]
                },
                {
                    title: 'Sender',
                    icon: 'fa-user-circle-o',
                    sectionTemplateName: 'sender',
                    className: 'sender'
                },
                {
                    title: 'Trigger',
                    icon: 'fa-play',
                    onEnter: () => this.mediator.toggleFilter(true),
                    onExit: () => this.mediator.toggleFilter(false)
                },
                {
                    title: 'Options',
                    icon: 'fa-cog',
                    sectionTemplateName: 'options',
                    className: 'options'
                },
                {
                    title: 'Actions',
                    icon: 'fa-paper-plane',
                    items: [
                        {
                            title: 'Duplicate',
                            action: () => {
                                messagesActions
                                    .duplicate(this.mediator.model, () => this.mediator.loading = true)
                                    .finally(() => this.mediator.loading = false);
                            },
                            isHidden: () => this.mediator.model.options('isNew')
                        },
                        {
                            title: 'Move - TODO',
                            isHidden: () => !this.mediator.model.options('isAuto') || this.mediator.model.options('isNew')
                        },
                        {
                            title: 'Delete',
                            action: () => {
                                messagesActions
                                    .delete(this.mediator.model, () => this.mediator.loading = true)
                                    .finally(() => this.mediator.loading = false);
                            },
                            isHidden: () => this.mediator.model.options('isNew')
                        },
                        {
                            title: 'Save & Close',
                            action: () => {
                                this.mediator.loading = true;
                                messagesActions
                                    .save(this.mediator.model)
                                    .finally(() => this.mediator.loading = false);
                            }
                        },
                        {
                            title: 'Send test email',
                            action: () => {
                                messagesActions
                                    .sendTestEmail(this.mediator.model);
                            },
                            isHidden: () => !this.mediator.model.options('isEmail')
                        },
                        {
                            title: 'Send',
                            action: () => {
                                this.mediator.loading = true;
                                messagesActions
                                    .send(this.mediator.model)
                                    .finally(() => this.mediator.loading = false);
                            },
                            isHidden: () => !this.mediator.model.options('showSendButton')
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
        .service('messagesEditNavSections', NavSections);
};
