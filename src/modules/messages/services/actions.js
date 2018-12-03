module.exports = function (module) {
    module
        .factory('messagesActions', function (MessagesMessageModel, dialogs, notifier, messagesSectionsHelper, $state, $q, Profile) {
            'ngInject';

            function confirmation(items, actionName, action, before = () => {
            }, ending = '') {
                const isArray = _.isArray(items);
                items = isArray ? items : [items];
                const isPlural = items.length > 1;
                const pluralEnding = isPlural ? 's' : '';
                const actionLower = actionName.toLowerCase();
                let dialogConfigs = {
                    title: `${actionName} Message${pluralEnding}`,
                    closeText: actionName + (isPlural ? ' Selected' : '')
                };

                if (isArray) {
                    dialogConfigs.body = isPlural ?
                        `Are you sure you want to ${actionLower} the ${items.length} selected messages${ending}?` :
                        `Are you sure you want to ${actionLower} the selected message${ending}?`;
                } else {
                    dialogConfigs.body = `Are you sure you want to ${actionLower} the message${ending}?`;
                }

                return dialogs
                    .confirm(dialogConfigs)
                    .then(() => before())
                    .then(() => {
                        return $q.all(
                            action(items)
                        );
                    })
                    .then(items => {
                        notifier.success(`Message${pluralEnding} ${isPlural ? 'were' : 'was'} successfully ${actionLower}d!`);
                        return isArray ? items : items[0];
                    });
            }

            class Actions {
                delete(items, before) {
                    let item = !_.isArray(items) ? item = items.copy() : null;
                    return confirmation(
                        items,
                        'Delete',
                        items => items.map(item => item.$delete()),
                        before
                    )
                        .then(() => messagesSectionsHelper.update())
                        .then(() => {
                            if (item) {
                                $state.go('messages.list.state', {
                                    type: item.message_type,
                                    role: item.user_role
                                });
                            }
                        });
                }

                moveTo(items, folder, before) {
                    return confirmation(
                        items,
                        'Move',
                        items => items
                            .map(item => {
                                item.message_folder_id = folder.id;
                                return item.$update();
                            }),
                        before,
                        ` to '${folder.title}' folder`
                    )
                        .then(items => {
                            messagesSectionsHelper.update();
                            return items;
                        });
                }

                duplicate(items, before) {
                    if (_.isArray(items)) {
                        return confirmation(
                            items,
                            'Duplicate',
                            items => items.map(
                                item => {
                                    item = MessagesMessageModel.copy(item);
                                    item = new MessagesMessageModel(item);
                                    item.set('title', `[Copy] ${item.get('title')}`);
                                    item.set('state', `draft`);
                                    return item.$save();
                                }
                            ),
                            before
                        );
                    } else {
                        let copy = items.copy();
                        copy.title = `[Copy] ${copy.title}`;
                        $state.go('messages.new', {
                            message: copy,
                            type: copy.message_type,
                            role: copy.user_role
                        });
                        return $q.resolve();
                    }
                }

                send(item) {
                    return item.$save()
                        .then(() => item.$send())
                        .then(() => {
                            $state.go('messages.details.index.view', {
                                id: item.get('id'),
                                type: item.get('message_type'),
                                role: item.get('user_role')
                            }, {reload: true});
                        })
                        .then(() => {
                            notifier.success('Message was sent');
                        });
                }

                sendTestEmail(item) {
                    return Profile.get().$promise
                        .then(me => dialogs.sendTestEmail(me.email))
                        .then(email => {
                            const variation = item.getVersion(),
                                  isSubjectEmpty  = !variation.subject,
                                  isBodyEmpty = !variation.json_blocks.length;

                            if (isSubjectEmpty || isBodyEmpty) {

                                const alertText = (isSubjectEmpty && isBodyEmpty) ? 'Subject Line and Email Body are' : (isBodyEmpty ? 'Message Body is' : 'Subject Line is');

                                return dialogs.confirm({
                                        title: `Send Test Email`,
                                        closeText: 'Send now',
                                        cancelText: 'Back to Edit',
                                        body: `Alert: Your ${alertText} empty`
                                    })
                                    .then(() => email);
                            } else {
                                return email;
                            }
                        })
                        .then((email) => item.$sendToEmail({ email, 'variation': item.getVersion() }))
                        .then(() => {
                            notifier.success('Message sent.');
                        }, (error) => {
                            if (error && error.data) {
                                notifier.error(error.data.raw_message, error.data.message);
                            }
                        });
                }

                save(item) {
                    let isNew = !item.get('id'),
                        method = isNew ? '$save' : '$update';

                    return item[method]()
                        .then(() => {
                            $state.go('messages.details.index.view', {
                                id: item.get('id'),
                                type: item.get('message_type'),
                                role: item.get('user_role')
                            });
                        })
                }
            }

            return new Actions();
        });
};

