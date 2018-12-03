module.exports = function (module) {
    module
        .factory('MessengerIO', function (socketSrv, Message, Conversations, pubSub, UploadResource, CONFIG, $q, $log) {
            'ngInject';

            const socket = socketSrv.socket;
            const sendUrl = `${CONFIG.apiUrl}/conversation/message`;
            const eventUrl = `${CONFIG.apiUrl}/admin/admin_event`;

            class Manager {
                constructor() {
                    this.listeners = {};
                    this.globalListeners = [];

                    socket.on('message', this.onHandler.bind(this, 'message'));
                    socket.on('widget_event', this.onHandler.bind(this, 'widget_event'));
                    socket.on('admin_event', this.onHandler.bind(this, 'admin_event'));
                }

                register(client, id) {
                    if (id) {
                        if (!_.has(this.listeners, id)) {
                            this.listeners[id] = [];
                        }
                        this.listeners[id].push(client);
                    } else {
                        this.globalListeners.push(client);
                    }
                }

                unregister(client, id) {
                    if (id) {
                        _.pull(this.listeners[id], client);
                    }
                    _.pull(this.globalListeners, client);
                }

                onHandler(event, data) {
                    $log.info(event, data);
                    let id = this.getConversationId(event, data);
                    this.prepareData(event, data)
                        .then((data) => {
                            this.emit(id, event, data);
                        });
                }

                getConversationId(event, data) {
                    let id;
                    switch (event) {
                        case 'message':
                            id = data.conversation_id;
                            break;
                        case 'widget_event':
                        case 'admin_event':
                            id = data.eventData.conversationId;
                            break;
                        default:
                            break;
                    }
                    return id;
                }

                prepareData(event, data) {
                    let promise = $q.resolve(data);
                    switch (event) {
                        case 'message':
                            promise = $q.all([data, Message.prepareMessages([data.message])])
                                .then(([data, messages]) => {
                                    data.message = messages[0];
                                    return data;
                                });
                            break;
                        default:
                            break;
                    }
                    return promise;
                }

                emit(id, event, data) {
                    let listeners = this.listeners[id] || [];
                    listeners.forEach(
                        listener => listener.emit(event, data)
                    );
                    this.globalListeners.forEach(
                        listener => listener(event, id, data)
                    );
                }

            }

            let manager = new Manager();

            class Client extends pubSub.EventEmitter {
                constructor(id) {
                    super();
                    this.id = id;
                    this._off = [];
                    manager.register(this, id);
                }

                setUserId(userId) {
                    this.userId = userId;
                }

                getMessages() {
                    return Message.query({conversation_id: this.id, limit: 0, sort: 'created_at ASC'}).$promise
                        .then(data => {
                            this.setAsRead();
                            return data;
                        })
                }

                send(data) {
                    data = angular.merge({}, data);
                    data.conversation_id = this.id;

                    return Client.post(data);
                }

                action(name) {
                    let data = {
                        eventName: name,
                        eventData: {
                            conversationId: this.id,
                            toUser: this.userId
                        }
                    };
                    return socketSrv.post(eventUrl, data);
                }

                on(event, cb, $scope) {
                    if (!this._$scope && $scope) {
                        this._$scope = $scope;
                        this._$scope.$on('$destroy', () => {
                            manager.unregister(this, this.id);
                        })
                    }
                    let off = super.on.apply(this, arguments);
                    this._off.push(off);
                    return () => {
                        _.pull(this._off, off);
                        off();
                    };
                }

                upload(file) {
                    return UploadResource.save(file);
                }

                setAsRead() {
                    Conversations.readByAdmin({id: this.id})
                        .$promise
                        .then(() => manager.emit(this.id, 'HasBeenRead'));
                }

                $destroy() {
                    manager.unregister(this, this.id);
                    this._off.forEach(off => off());
                }

                static changeConversationStatus(id, status, assignee_id) {
                    let data = {
                        conversation_id: id,
                        sub_type: status
                    };
                    if (status === 'assignment') {
                        data.assignee_id = assignee_id;
                    }
                    return Client.post(data);
                }

                static post(data) {
                    return socketSrv
                        .post(sendUrl, data);
                }

                static on(callback) {
                    manager.register(callback);
                    return () => manager.unregister(callback);
                }
            }

            return Client;
        });
};
