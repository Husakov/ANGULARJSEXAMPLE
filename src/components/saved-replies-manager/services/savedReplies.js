module.exports = function (mod) {
    mod.factory('savedReplies', function (SavedReply, Profile, mnhMessageUtils) {
        'ngInject';

        let me = Profile.get(),
            parser = new mnhMessageUtils.MessageParser();

        class SavedReplies {
            constructor() {
                this.query();
            }

            query() {
                this.list = SavedReply.query();
                return this.list;
            }

            save(item) {
                item.body = parser.toHtml(item.blocks);
                return me.$promise
                    .then(() => {
                        let method = 'save',
                            data = {
                                name: item.name,
                                admin_id: me.id,
                                blocks: item.blocks,
                                body: item.body
                            };


                        if (item.id) {
                            method = 'update';
                            data.id = item.id;
                        }

                        SavedReply.clearCache();
                        return SavedReply[method](data).$promise;
                    })
                    .then(newItem => {
                        if (!item.id) {
                            item.id = newItem.id;
                        }
                        return newItem;
                    })
                    .finally(() => {
                        this.query();
                    });
            }

            remove(item) {
                SavedReply.clearCache();
                return SavedReply.delete(item).$promise
                    .finally(() => {
                        this.query();
                    });
            }

            prepare({id, conversationId}) {
                return SavedReply
                    .prepare({id: id, conversationId: conversationId})
                    .$promise
                    .then(reply => reply.body);
            }
        }

        return new SavedReplies();
    });
};
