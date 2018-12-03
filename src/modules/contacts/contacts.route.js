module.exports = function (module) {
    function pageTemplate(folder, file = 'index') {
        return require(`./pages/${folder}/${file}.html`);
    }

    const templates = {
        list: pageTemplate('list'),
        details: pageTemplate('details')
    };

    module.config(function ($stateProvider) {
        'ngInject';
        const baseState = 'contacts';

        $stateProvider
            .state(baseState, {
                data: {
                    permissions: {
                        only: 'isAuthorized',
                        redirectTo: 'login'
                    }
                },
                template: '<div class="contacts-container" ui-view></div>',
                url: '/contacts',
                redirectTo: `${baseState}.list`
            })
            .state(`${baseState}.list`, {
                controller: 'ContactsListController as $ctrl',
                templateUrl: templates.list,
                redirectTo: `${baseState}.list.mode`
            })
            .state(`${baseState}.list.mode`, {
                url: '/{mode:users|companies}/:segmentId?predicates',
                params: {
                    mode: 'users',
                    segmentId: null,
                    predicates: null
                }
            })
            .state(`${baseState}.details`, {
                url: '/{mode:users|companies|admins}/profile/:id',
                views: {
                    'secondmenu@': {
                        template:'<contacts-details contact="contact" mode="mode"></contacts-details>',
                        controller: ($scope, $stateParams, contactsDetailsHelper) => {
                            'ngInject';
                            $scope.mode = $stateParams.mode;
                            $scope.contact = contactsDetailsHelper.getContactData($scope.mode);
                        }
                    },
                    '': {
                        templateUrl: templates.details,
                        controller: 'ContactsDetailsController as $ctrl'
                    }
                }
            })
            .state(`${baseState}.details.notes`, {
                url: '/activity/:section'
            });
    });
};
