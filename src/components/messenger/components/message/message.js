let templates = {
    message: require('./message.html'),
    note: require('./note.html'),
    info: require('./info.html'),
    attachment: require('../templates/attachment.html'),
    typing: require('./typing.html')
};

class Controller {
    constructor(Message, dialogs, $element, $sce) {
        'ngInject';

        this.Message = Message;
        this.dialogs = dialogs;

        this.templates = templates;

        if (this.message) {
            this.body = $sce.trustAsHtml(this.message.body);

            $element.on('click', '.message-content img:not(.emojione)', $e => {
                this._openImage($e.target.getAttribute('src'));
            });
        }
    }

    getTemplate() {
        let msg = this.message,
            type;

        if (this.typing) {
            type = 'typing';
        } else if (msg.type === 'message' || msg.sub_type === 'comment') {
            type = 'message';
        } else if (msg.sub_type === 'note') {
            type = 'note';
        } else {
            type = 'info';
        }
        return templates[type];
    }

    saveReply() {
        this.messenger.saveRelpy(this.message);
    }

    editTags() {
        this.messenger.editTags(this.message);
    }

    removeTag(tag) {
        this.messenger.messageHelper
            .updateTags(this.message, _.without(this.message.tags, tag));
    }

    hasAttachment() {
        return this.message.upload_ids.length > 0;
    }

    _openImage(src) {
        this.dialogs.imageViewer(src);
    }
}

module.exports = {
    template: '<ng-include src="::$ctrl.getTemplate()"></ng-include>',
    controller: Controller,
    bindings: {
        message: '<?',
        typing: '<?'
    },
    require: {
        messenger: '^messenger'
    }
};
