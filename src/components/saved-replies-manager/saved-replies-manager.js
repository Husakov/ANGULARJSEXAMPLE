require('./saved-replies-manager.scss');

let templateUrl = require('./saved-replies-manager.html');

class Controller {
    constructor(savedReplies) {
        'ngInject';

        this.selected = null;
        this.service = savedReplies;
        this.listReady = false;

        this.getList();

        this.onChange = _.debounce(this.onChange.bind(this), 1000);
    }

    $onInit() {
        this.assign({instance: this});
    }

    getList() {
        this.listReady = false;
        return this.service.query()
            .$promise
            .then(list => {
                this.list = list;
                this.listReady = true;
            });
    }

    show(item) {
        let id = item.id || _.uniqueId();
        this.selected = angular.merge({}, item);
        this.saved = true;
        this.editorName = _.uniqueId(`save-replies-editor.${id}.`);
    }

    checkAttachedFile (body) {
        let message = body;
        if (message) {
            if (message.toLowerCase().indexOf('<img ') > 0) {
                return '[File Attached]';
            } else if (message.toLowerCase().indexOf('mnh-m-video-wrapper') > 0) {
                return '[Video Attached]';
            }
            else {
                return message.replace(/<p[^>]*>/g, ''); // remove empty p-tags
            }
        }
        return message;
    }

    delete() {
        if (this.selected) {
            this.listReady = false;
            this.service
                .remove(this.selected)
                .finally(() => this.getList());
            this.clear()
        }
    }

    save() {
        if (this.selected) {
            this.listReady = false;
            return this.service
                .save(this.selected)
                .then(() => this.saved = true)
                .finally(() => this.getList());
        }
    }

    onChangeHandler() {
        this.saved = false;
        this.onChange();
    }

    onChange() {
        this.save()
    }

    clear() {
        if (!this.saved) {
            this.save();
        }
        this.selected = null;
    }

    create(message = '') {
        let reply = {name: ''};
        if (_.isString(message)) {
            reply.blocks = [{
                type: 'paragraph',
                text: message
            }];
        } else {
            Object.assign(reply, angular.copy(_.pick(message, 'blocks')));
        }
        this.clear();
        this.show(reply);
    }

    select(item) {
        if (item) {
            this.selected = item
        }
        this.callback({id: this.selected.id, reply: this.selected});
        this.clear();
    }
}

module.exports = angular.module('intercom.components.savedRepliesManager', [
    require('./services/savedRepliesManager.services.module').name
])
    .component('savedRepliesManager', {
        templateUrl: templateUrl,
        controller: Controller,
        bindings: {
            callback: '&',
            assign: '&'
        }
    });
