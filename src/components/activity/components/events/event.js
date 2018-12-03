module.exports = function (module) {
    let baseTemplate = require('./base.html');

    let templates = {
        conversations: require('./conversation.html'),
        messages: require('./conversation.html'),
        tags: require('./tag.html'),
        segments: require('./segment.html'),
        notes: require('./notes.html'),
        events: require('./event.html'),
        default: require('./default.html')
    };

    class Controller {
        constructor(activityHelper) {
            'ngInject';

            this.helper = activityHelper;
        }

        $onInit() {
            this.user = this.helper.getUser(this.event);
        }

        getTemplateUrl() {
            return _.get(templates, this.helper.getType(this.event), templates.default);
        }

        getIconName() {
            let activityType = this.helper.getActivityType(this.activityTypes, this.event);
            return _.get(activityType, 'icon', 'tag');
        }

        getClassNames() {
            return this.isConversation() ? 'conv-box' : 'box-body tag-event';
        }

        isConversation() {
            let type = this.helper.getType(this.event);
            return type === 'conversations' || type === 'messages';
        }
    }

    module
        .component('activityEvent', {
            templateUrl: baseTemplate,
            controller: Controller,
            bindings: {
                event: '<',
                activityTypes: '<'
            }
        });
};
