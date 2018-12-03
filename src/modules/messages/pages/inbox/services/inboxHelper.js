module.exports = function (module) {
    module
        .factory('inboxHelper', function (conversationManager, inboxesList, MessengerIO, $state, $timeout, $q) {
            'ngInject';
            const baseParams = {
                assignee_identifier: 'all',
                status: 'opened',
                limit: 15,
                skip: 0,
                sort: 'desc'
            };

            class FirstConversations {
                constructor() {
                    this.update();
                }

                update() {
                    let oldDefer = this.defer;
                    this.defer = $q.defer();
                    this.promise = this.defer.promise
                        .then(
                            items => items.length > 0 ? items[0] : $q.reject(),
                            err => err === 'reset' ? this.promise : $q.reject(err)
                        );
                    if (oldDefer) {
                        oldDefer.reject('reset');
                    }
                }

                resolve(items) {
                    if (this.defer) {
                        this.defer.resolve(items);
                        delete this.defer;
                    }
                }
            }

            const firstConversation = new FirstConversations();

            function getOrder(order = 'desc') {
                return 'last_message_at ' + order.toUpperCase();
            }

            function mapParams({identifier, status, order, tag, search}) {
                let params = {
                    assignee_identifier: identifier,
                    status,
                    sort: getOrder(order)
                };
                if (tag) {
                    params.tag_id = tag;
                }
                if (search) {
                    params.search = search;
                }
                return params;
            }

            function validateParams(newParams, oldParams) {
                let props = ['identifier', 'status', 'order', 'tag', 'search'];
                newParams = _(newParams).pick(props).pick(_.identity).value();
                oldParams = _(oldParams).pick(props).pick(_.identity).value();
                if (angular.equals(newParams, oldParams)) {
                    return false;
                }
                if (newParams.identifier && newParams.status && newParams.order) {
                    return newParams;
                }
                return null;
            }

            class InboxHelper {
                constructor() {
                    this.init();
                    inboxesList.on('updated', () => this.setCurrentInbox());
                }

                init() {
                    delete this.listHelper;
                    delete this.paramsPromise;
                    delete this.params;
                    delete this.ready;
                    this.readyDefer = $q.defer();
                    this.ready = this.readyDefer.promise;
                    this.currentInbox = null;
                }

                setListHelper(listHelper) {
                    this.listHelper = listHelper;
                    this.readyDefer.resolve();
                    MessengerIO.on((event, id, data) => {
                        if (event === 'message' && this.currentInbox && data.conversation) {
                            this.onNewMessage(data.conversation);
                        }
                    });
                }

                destroy() {
                    this.init();
                }

                setParams(params) {
                    let isFirstOne = !this.paramsPromise;
                    params = validateParams(params, this.params);
                    if (!params) {
                        if (_.isNull(params)) {
                            $state.go('.', {});
                        }
                        return;
                    }
                    inboxesList.ready
                        .then(() => {
                            if (!this.setCurrentInbox(params)) {
                                return;
                            }
                            this.paramsPromise = this.ready
                                .then(() => {
                                    this.params = angular.copy(params);
                                    if (!isFirstOne) {
                                        this.listHelper.resetItems();
                                    }
                                    return _.assign({}, baseParams, mapParams(params));
                                });
                        });
                }

                fetch(helperParams) {
                    return this.paramsPromise
                        .then(params => {
                            return conversationManager.query(_.assign({}, params, helperParams)).$promise;
                        })
                        .then(items => {
                            firstConversation.resolve(items);
                            return items;
                        });
                }

                getFirstConversation(params) {
                    if (validateParams(params, this.params)) {
                        firstConversation.update();
                    }
                    return this.ready
                        .then(() => firstConversation.promise);
                }

                assignToCheckedConversations(assignee) {
                    let conversations = this.listHelper.checkedItems,
                        ids = conversations.map(c => c.id);
                    conversationManager.changeStatus(ids, 'assignment', assignee);
                    this.listHelper.clearSelection();
                }

                assignToConversation(assignee, conversationId) {
                    conversationManager.changeStatus([conversationId], 'assignment', assignee);
                }

                changeCheckedConversationsStatus(status) {
                    this.changeConversationsStatus(this.listHelper.checkedItems, status);
                }

                changeConversationsStatus(items, status) {
                    let ids = items.map(c => c.id);
                    conversationManager.changeStatus(ids, status);
                    this.listHelper.clearSelection();
                }

                setCurrentInbox(params = this.params) {
                    let inbox = params && params.identifier && inboxesList.findInbox(params.identifier);
                    if (!inbox) {
                        $state.go('.', {});
                        return false;
                    }
                    this.currentInbox = inbox;
                    return true;
                }

                onNewMessage(conversation) {
                    let index = -1;
                    if (inboxesList.isInInbox(this.currentInbox, conversation)) {
                        if (this.params.order === 'desc') {
                            index = 0;
                        } else if (this.listHelper.allLoaded) {
                            index = this.listHelper.items.length;
                        }
                    }

                    if (index !== -1) {
                        conversationManager
                            .get(conversation.id)
                            .$promise
                            .then(item => {
                                this.listHelper.insertTo(item, index);
                            });
                    } else {
                        this.listHelper.removeFromList(conversation);
                    }
                }
            }

            return new InboxHelper();
        });
};
