module.exports = function (mod) {
    mod.factory('conversationManager', function (Conversations, MessengerIO, pubSub, $q) {
        'ngInject';

        let conversations = {},
            manager;

        function exist(id) {
            return id in conversations;
        }

        function available(id) {
            if (!exist(id)) {
                insert(Conversations.get({id: id}), id);
            }
        }

        function insert(item, id) {
            id = id || item.id;
            if (!exist(id)) {
                conversations[id] = {};
            }
            item.$promise = (item.$promise || $q.resolve())
                .then((item) => {
                    angular.extend(conversations[id], item);
                    manager.emit('updated', id, conversations[id]);
                    return conversations[id]
                });
            angular.extend(conversations[id], item);
            return conversations[id];
        }

        function sync(ids) {
            Conversations.getByIds(ids)
                .$promise
                .then(
                    results => results.forEach(
                        item => insert(item)
                    )
                )
        }

        class ConversationManager extends pubSub.EventEmitter {
            query(params) {
                let result = [];
                result.$promise = Conversations.query(params)
                    .$promise
                    .then(items => {
                        let totalCount = items.total_count;
                        items = items.map(item => insert(item));
                        result.push(...items);
                        result.total_count = totalCount;
                        return result;
                    });
                return result;
            }

            get(id) {
                available(id);
                let conversation = conversations[id];
                if (!('$promise' in conversation)) {
                    conversation.$promise = $q.resolve(conversation);
                }
                return conversation;
            }

            changeStatus(ids, status, assignee, autoassigned) {
                let assignee_id;
                ids = angular.isArray(ids) ? ids : [ids];
                if (assignee) {
                    assignee_id = assignee.id
                }
                $q.all(ids.map(
                    id => MessengerIO.changeConversationStatus(id, status, assignee_id)
                ))
                    .then(() => {
                        sync(ids);
                        let change_status = autoassigned ? 'autoassigment' : status;
                        this.emit('changedStatus', ids, change_status, assignee);
                    });
            }
        }

        manager = new ConversationManager();

        MessengerIO.on((event, id, data) => {
            if (!exist(id)) {
                return;
            }
            let conversation = conversations[id];
            switch (event) {
                case 'message':
                    Conversations.setLastMessage(conversation, data.message);
                    conversation.has_been_read = false;
                    break;
                case 'UserSeen':
                    conversation.read_at = (new Date()).toISOString();
                    break;
                case 'HasBeenRead':
                    conversation.has_been_read = true;
                    break;
                default:
                    break;
            }
        });

        return manager;
    });
};
