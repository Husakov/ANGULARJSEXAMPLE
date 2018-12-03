require('./messenger.scss');

const templateUrl = require('./index.html');

class Controller {
    constructor(MessengerIO, $scope, messengerAudio, MessengerMessageHelper, Profile, slidePanelManager, $timeout, $q) {
        'ngInject';
        this.MessengerIO = MessengerIO;
        this.$scope = $scope;
        this.audio = messengerAudio;
        this.MessageHelper = MessengerMessageHelper;
        this.currentUser = Profile.get();
        this.$timeout = $timeout;
        this.$q = $q;

        const hideTyping = this.hideTyping.bind(this);
        const memoizedHideTyping = _.memoize(() => _.debounce(hideTyping, 7000));

        this.hideTypingNow = function (id) {
            memoizedHideTyping(id).cancel();
            hideTyping(id, false);
        };
        this.hideTypingDebounced = function () {
            return memoizedHideTyping(...arguments)(...arguments);
        };

        this.loading = false;
        this.typing = [];

        this.tagPanel = slidePanelManager.render({
            template: '<tag-search done="$ctrl.resolveTags({tags: tags})" existed="$ctrl.tags"></tag-search>',
            background: true,
            slideAppContainer: true,
            $scope: $scope.$new()
        });
    }

    $onInit() {
        this.loading = true;
        this.$onChanges();
    }

    $onChanges() {
        if (this.conversationId && this.conversationId !== this.currentId) {
            this._clear();
            this.currentId = this.conversationId;
            this._create(this.currentId);
        }
    }

    $onDestroy() {
        this._clear();
    }

    _create(id) {
        this.client = new this.MessengerIO(this.conversationId);
        this.messageHelper = new this.MessageHelper(this.conversationId);

        this.client.on('message', (event, data) => {
            if (data.message.sub_type !== 'open' &&
                data.message.sub_type !== 'close' &&
                data.message.sub_type !== 'assignment') {
                this.audio.playOnNewMessageReceived();
            }
            this.addNewMessage(data);
        }, this.$scope);
        this.client.on('widget_event', ($event, action) => this.userAction(action), this.$scope);
        this.client.on('admin_event', ($event, action) => this.adminAction(action), this.$scope);

        this.loading = true;
        this.$q
            .all([
                this.client.getMessages(),
                this.messageHelper
                    .getConversation()
                    .$promise
            ])
            .then(([messages, conversation]) => {
                if (id === this.currentId) {
                    messages.forEach(
                        message => this.addMessage(message)
                    );
                    this.conversation = conversation;
                    this.client.setUserId(this.conversation._mainParticipant.id);
                    this.$scope.$broadcast('scroll-down');
                    this.$timeout(() => {
                        this.loading = false;
                    });
                }
            });
    }

    _clear() {
        this.messages = [];
        this.conversation = null;
        this.currentId = null;
        if (this.client) {
            this.client.$destroy();
        }
        this.client = null;
        this.messageHelper = null;
    }

    send(data) {
        this.client.send(data);
        this.audio.playOnMessageSent();
    }

    addNewMessage(data) {
        const message = data.message;
        const id = message.admin && message.admin.id || message.user && message.user.id;
        this.addMessage(message);
        this.client.setAsRead();
        this.hideTypingNow(id);
        this.$scope.$broadcast('scroll-down');
    }

    addMessage(message) {
        this.messages.push(
            this.messageHelper.parseMessage(message, this.conversation)
        );
    }

    saveRelpy(message) {
        this.reply.saveReply(message);
    }

    registerReply(reply) {
        this.reply = reply;
    }

    userAction(action) {
        if (action.eventName === 'UserSeen') {
            this.messageHelper.userSeen(this.messages);
        }
        if (action.eventName === 'UserIsTyping') {
            this.showTyping({userId: action.eventData.userId});
        }
    }

    action(name) {
        this.client.action(name);
    }

    adminAction(action) {
        if (action.eventName === 'AdminIsTyping') {
            this.showTyping(action.eventData);
        }
    }

    showTyping(data) {
        let typing;
        if (data.userId) {
            typing = {
                id: data.userId,
                user: _.find(this.conversation._participants, {id: data.userId})
            };
        } else if (data.adminId && data.adminId !== this.currentUser.id) {
            typing = {
                id: data.adminId,
                admin: {
                    id: data.adminId,
                    name: data.adminName,
                    avatar: {
                        image_url: data.adminAvatar
                    }
                }
            };
        }
        if (typing) {
            if (!_.some(this.typing, {id: typing.id})) {
                this.typing.push(typing);
            }
            this.hideTypingDebounced(typing.id);
            this.$scope.$broadcast('scroll-down');
        }
    }

    hideTyping(id, apply = true) {
        _.remove(this.typing, {id});
        if (apply) {
            this.$scope.$apply();
        }
        this.$scope.$broadcast('scroll-down');
    }

    editTags(message) {
        this.tagEditMessage = message;
        this.tags = message.tags;
        this.tagPanel.toggle(true);
    }

    resolveTags({tags}) {
        this.tagPanel.toggle(false);
        this.messageHelper.updateTags(this.tagEditMessage, tags);
        delete this.tagEditMessage;
    }
}

module.exports = {
    templateUrl: templateUrl,
    controller: Controller,
    bindings: {
        conversationId: '@'
    }
};
