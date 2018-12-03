module.exports = function (module) {
    let templateUrl = require('./index.html');
    let overlayTemplate = require('./overlay.html');

    class Controller {
        constructor(conversationManager, MessengerIO, Profile, $timeout, $scope, inboxHelper) {
            'ngInject';

            this.inboxHelper = inboxHelper;
            this.$timeout = $timeout;
            this.overlayTemplate = overlayTemplate;
            this.overlay = null;
            this.$scope = $scope;
            this.currentUser = Profile.get();

            this.hideTyping = _.debounce(this.hideTyping.bind(this), 7000);

            conversationManager.on('changedStatus', ($event, ids, status, assignee) => {
                if (ids.includes(this.model.id)) {
                    let admin = this.currentUser,
                        title = '',
                        to;
                    switch (status) {
                        case 'close':
                            title = admin.name + ' closed this conversation';
                            break;
                        case 'open':
                            title = admin.name + ' re-open this conversation';
                            break;
                        case 'assignment':
                            to = admin.id === assignee.id ? 'themselves' : assignee.name;
                            title = `${admin.name} assigned this conversation to ${to}`;
                            break;
                        case 'autoassigment':
                            title = `You replied and auto-assigned to Yourself`;
                            break;
                        default:
                            return;
                    }
                    this._showOverlay(admin, title, assignee)
                }
            }, $scope);

            MessengerIO.on((event, id, data) => {
                if (id !== this.model.id) {
                    return;
                }
                if (event === 'admin_event' && data.eventName === 'AdminIsTyping' && data.eventData.adminId !== this.currentUser.id) {
                    this.showTyping(data.eventData);
                }
                if (event === 'message') {
                    this.hideTyping.cancel();
                    this.typingAdmin = null;
                }
            });

            this.message = '';
            $scope.$watch(() => this.model._lastMessage.body, () => this.setMessageBody());
        }

        toggleElement() {
            this.inboxHelper.listHelper.toggleElement(this.model);
        }

        changeStatus($event, status) {
            this.inboxHelper.changeConversationsStatus([this.model], status);
            $event.preventDefault();
            $event.stopPropagation();
        }

        _showOverlay(who, title, to) {
            this.overlay = {
                who,
                title,
                to
            };
        }

        setMessageBody() {
            let message = this.model._lastMessage.body;
            if (message) {
                if (message.toLowerCase().indexOf('<img ') > 0) {
                    message = '[File Attached]';
                } else {
                    message = message.replace(/<p[^>]*>/g, ''); // remove empty p-tags
                }
                this.message = message;
            }
        }

        showIconIfRealAttachmentsExists() {
            if (this.model._lastMessage.hasOwnProperty('upload_ids')) {
                return this.model._lastMessage.upload_ids.length > 0;
            }
        }

        showTyping(data) {
            this.typingAdmin = {
                id: data.adminId,
                name: data.adminName,
                avatar: {
                    image_url: data.adminAvatar
                }
            };
            this.hideTyping();
        }

        hideTyping() {
            this.typingAdmin = null;
            this.$scope.$apply();
        }
    }

    module
        .component('inboxSideElement', {
            controller: Controller,
            templateUrl,
            bindings: {
                model: '=conversation'
            }
        });
};
