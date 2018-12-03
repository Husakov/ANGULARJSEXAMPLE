const templateUrl = require('./reply.html');
const templates = {
    attachment: require('../templates/attachment.html')
};

class Controller {
    constructor($scope, $q, conversationManager, Profile) {
        'ngInject';

        this.templates = templates;
        this.$scope = $scope;
        this.$q = $q;
        this.conversationManager = conversationManager;
        this.currentUser = Profile.get();

        this.isNote = false;
        this.blocks = [];

        this.showTyping = _.throttle(this.showTyping.bind(this), 1500);
    }

    $onInit() {
        if (this.messenger.conversationId) {
            this.render();
        }

        this.messenger.registerReply(this);

        this.$scope.$watch(() => this.messenger.conversationId, () => {
            if (this.messenger.conversationId) {
                this.render();
            }
        });

        this.$scope.$watch(() => this.isNote, (newValue, oldValue) => {
            if (newValue !== oldValue) {
                this.render();
            }
        });
    }

    render() {
        delete this.blocks;
        this.editor = null;
        this.$scope.$broadcast('recompile');
    }

    switchNote() {
        this.isNote = !this.isNote;
    }

    send(changeStatus, blocks = this.blocks) {
        let data = {
            sub_type: this.isNote ? 'note' : 'comment',
            blocks: angular.copy(blocks)
        };

        if (changeStatus) {
            data.sub_type = this.messenger.conversation.is_closed ? 'open' : 'close';
        }

        if (!this.messenger.conversation.assignee_id) {
            this.conversationManager.changeStatus(this.messenger.conversation.id, 'assignment', this.currentUser, true);
        }

        if (blocks.uploads && blocks.uploads.length) {
            data.uploads = angular.copy(blocks.uploads);
        }

        if (blocks.mentions && blocks.mentions.length) {
            data.mentioned_admins = angular.copy(blocks.mentions);
        }

        this.messenger.send(data);
        this.showSendButton = false;
        this.editor.clear();
    }

    canSend() {
        return this.editor && !this.editor.isEmpty();
    }

    saveReply(message) {
        this.editor.saveReply(message);
    }

    onKeypress($e) {
        if (!this.isNote) {
            this.showTyping();
        }
        if ($e.which === 13 && !$e.shiftKey && this.canSend()) {
            this.send();
        }
    }

    showTyping() {
        this.messenger.action('AdminIsTyping');
    }
}

module.exports = {
    templateUrl,
    controller: Controller,
    require: {
        messenger: '^messenger'
    }
};
