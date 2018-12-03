module.exports = function (mod) {
    mod.factory('MessengerMessageHelper', function (Message, emojis, conversationManager, mnhMessageUtils, moment) {
        'ngInject';

        const parser = new mnhMessageUtils.MessageParser();
        let wrapList = [
            {
                className: 'emoj-wrapper',
                test: function (block) {
                    return block.text && _.isString(block.text) && emojis.test(block.text);
                }
            },
            {
                className: 'img-wrapper',
                test: function (block) {
                    return block.type === 'image';
                }
            },
            {
                className: 'video-wrapper',
                test: function (block) {
                    return block.type === 'video';
                }
            }
        ];


        return class MessengerMessageHelper {
            constructor(id) {
                this.id = id;
            }

            updateTags(message, tags) {
                message.tags = tags;
                Message.updateTags(
                    {id: message.id},
                    {tag_ids: tags.map(tag => tag.id)}
                );
            }

            parseMessage(message) {
                let read_at = new Date(this.conversation.read_at),
                    created_at = new Date(message.created_at),
                    wrappers = [],
                    blocks = message.blocks;
                message = angular.copy(message);
                message._seen = read_at - created_at > 0;
                message.created_at_block = moment(created_at).format('MMM D, YYYY');

                if (blocks) {
                    message.body = parser
                        .toHtml(blocks);

                    if (blocks.length === 1) {
                        wrappers.push('one-block');
                        let block = message.blocks[0];
                        wrapList.forEach(wrapper => {
                            if (wrapper.test(block)) {
                                wrappers.push(wrapper.className);
                            }
                        });
                    }

                    message.body = emojis.toImage(message.body, wrappers.includes('emoj-wrapper') ? 64 : 24);
                }

                message._wrappers = wrappers;

                return message;
            }

            getConversation() {
                this.conversation = conversationManager.get(this.id);
                return this.conversation;
            }

            userSeen(messages) {
                messages.forEach(m => m._seen = true);
            }
        };
    });
};
