module.exports = function (module) {
    function pageTemplate(folder, file = 'index') {
        return require(`./pages/${folder}/${file}.html`);
    }

    const templates = {
        list: pageTemplate('list'),
        edit: {
            index: pageTemplate('edit'),
            sidebar: pageTemplate('edit', 'sidebar')
        },
        details: {
            index: pageTemplate('details'),
            sidebar: pageTemplate('details', 'sidebar'),
            view: pageTemplate('details', 'details'),
            reports: pageTemplate('details/reports')
        },
        inbox: pageTemplate('inbox')
    };

    module.config(function ($stateProvider, messagesListMenuItems) {
        'ngInject';
        const baseState = 'messages';
        const listMenu = messagesListMenuItems;
        const typeUrl = '{type:auto|manual}';
        const roleUrl = '{role:user|lead|visitor}';

        $stateProvider
            .state(baseState, {
                url: '/messages',
                data: {
                    permissions: {
                        only: 'isAuthorized',
                        redirectTo: 'login'
                    }
                },
                template: '<div id="messages-container" ui-view></div>',
                redirectTo: baseState + '.list'
            })
            .state(`${baseState}.inbox`, {
                url: '/inbox',
                views: {
                    'secondmenu@': {
                        template: '<inbox-side-panel></inbox-side-panel>'
                    },
                    '': {
                        templateUrl: templates.inbox,
                        controller: 'MessagesInboxController as $ctrl'
                    }
                },
                redirectTo: `${baseState}.inbox.conversation`
            })
            .state(`${baseState}.inbox.conversation`, {
                url: '/:identifier/:id?status&{order:desc|asc}&tag&search',
                params: {
                    status: 'opened',
                    order: 'desc',
                    identifier: function (Profile) {
                        'ngInject';
                        return Profile.get().id;
                    }
                },
                redirectTo: function (params, inboxHelper, $q, Profile) {
                    'ngInject';
                    let {identifier, status, order, id} = params;
                    if (!identifier || !status || !order) {
                        return ['.', {
                            identifier: identifier || Profile.get().id,
                            status: status || 'opened',
                            order: order || 'desc'
                        }];
                    }
                    if (!id) {
                        return inboxHelper.getFirstConversation(params)
                            .then(conversation => [`${baseState}.inbox.conversation`, {id: conversation.id}]);
                    }
                    return $q.reject();
                }
            })
            .state(`${baseState}.new`, {
                url: `/${typeUrl}/${roleUrl}/new`,
                params: {
                    message: null,
                    userIds: null
                },
                views: {
                    'secondmenu@': {
                        templateUrl: templates.edit.sidebar,
                        controller: 'MessagesEditSidebarController as $ctrl'
                    },
                    '': {
                        templateUrl: templates.edit.index,
                        controller: 'MessagesEditController as $ctrl'
                    }
                }
            })
            .state(`${baseState}.details`, {
                url: `/${typeUrl}/${roleUrl}/details/:id`,
                template: '<div ui-view class="flex-col"></div>',
                redirectTo: `${baseState}.details.index`
            })
            .state(`${baseState}.details.index`, {
                templateUrl: templates.details.index,
                controller: 'MessagesDetailsController as $ctrl',
                redirectTo: `${baseState}.details.index.view`
            })
            .state(`${baseState}.details.index.view`, {
                views: {
                    'secondmenu@': {
                        templateUrl: templates.details.sidebar,
                        controller: 'MessagesDetailsSidebarController as $ctrl'
                    },
                    '': {
                        templateUrl: templates.details.view
                    }
                }
            })
            .state(`${baseState}.details.index.report`, {
                url: '/reports',
                templateUrl: templates.details.reports,
                redirectTo: `${baseState}.details.index.report.section`,
                controller: 'MessagesDetailsReportsController as $ctrl'
            })
            .state(`${baseState}.details.index.report.section`, {
                url: '/:section',
                params: {
                    section: 'sent',
                    inverted: false
                }
            })
            .state(`${baseState}.details.edit`, {
                url: '/edit',
                params: {
                    model: null
                },
                views: {
                    'secondmenu@': {
                        templateUrl: templates.edit.sidebar,
                        controller: 'MessagesEditSidebarController as $ctrl'
                    },
                    '': {
                        templateUrl: templates.edit.index,
                        controller: 'MessagesEditController as $ctrl'
                    }
                }
            })
            .state(`${baseState}.list`, {
                templateUrl: templates.list,
                controller: 'MessagesListController as $ctrl',
                redirectTo: `${baseState}.list.state`
            })
            .state(`${baseState}.list.state`, {
                url: `/${typeUrl}/${roleUrl}/{state}`,
                params: {
                    type: 'auto',
                    role: 'user',
                    state: null
                },
                redirectTo: function (params, $q) {
                    'ngInject';
                    let {type, role, state} = params;
                    if (!type || !role || !state) {
                        return ['.', {
                            type: type || 'auto',
                            role: role || 'user',
                            state: state || listMenu[type].items[0].state
                        }];
                    }
                    if (role === 'visitor' && type === 'manual') {
                        return ['.', {role: 'user'}];
                    }
                    return $q.reject();
                }
            });
    });
};
