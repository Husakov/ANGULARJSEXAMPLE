module.exports = function (module) {
    module
        .factory('messagesSectionsHelper', function (Dispatch, MessageFolder, Profile, messagesListMenuItems, pubSub, $q) {
            'ngInject';

            let currentUser = Profile.get(),
                menu = null,
                ready;

            function initMenu({counts, folders}) {
                menu = angular.merge({}, messagesListMenuItems);

                folders = folders.map(f => ({
                    id: f.id,
                    title: f.name,
                    icon: 'fa-folder',
                    state: f.id,
                    isFolder: true,
                    params: {
                        message_folder_id: f.id
                    },
                    count: counts.folders[f.id] || 0
                }));

                menu.auto.items.forEach(
                    item => {
                        item.count = item.state !== 'my' ? counts.auto[item.state] : counts.my;
                        if (item.state === 'my') {
                            item.params.from_id = currentUser.id;
                        }
                    }
                );
                menu.auto.items.push(...folders);
                menu.auto.folders = folders;

                menu.manual.items.forEach(item => item.count = counts.manual[item.state] || 0);
                return menu;
            }

            class SectionsHelper extends pubSub.EventEmitter {
                init() {
                    ready = $q
                        .all({
                            currentUser: currentUser.$promise,
                            counts: Dispatch.counts().$promise,
                            folders: MessageFolder.query().$promise
                        })
                        .then(initMenu);
                }

                getMenu(path) {
                    return ready.then(menu => menu[path]);
                }

                getFolders() {
                    return ready
                        .then(menu => {
                            return menu.auto.folders;
                        });
                }

                getParams(type, state) {
                    return ready.then(menu => {
                        let item = _.find(menu[type].items, item => item.state === state);
                        return item && (item.params || {message_type: type, state: item.state}) || null;
                    });
                }

                saveFolder(item) {
                    let promise;
                    if (!item.id) {
                        promise = MessageFolder
                            .save({name: item.title})
                            .$promise;
                    } else {
                        promise = MessageFolder
                            .update({id: item.id}, {id: item.id, name: item.title})
                            .$promise;
                    }
                    return promise
                        .then(() => {
                            this.update();
                        });
                }

                deleteFolder(item) {
                    return MessageFolder
                        .remove({id: item.id})
                        .$promise
                        .then(() => {
                            this.update()
                        });
                }

                update() {
                    this.init();
                    ready.then(() => this.emit('update'));
                }
            }

            return new SectionsHelper();
        })
        .run(function (messagesSectionsHelper) {
            'ngInject';
            messagesSectionsHelper.init();
        });
};
