module.exports = function (module) {
    let templates = {
        index: require('./index.html'),
        tabs: require('./tabs.html'),
        tabsAppMessenger: require('./tabs-app-messenger.html'),
        general: require('./general/general.html'),
        teammates: require('./general/teammates.html'),
        profile: require('./personal/account/profile.html'),
        changePassword: require('./personal/change-password/changePassword.html'),
        notification: require('./personal/account/notification.html'),
        conversation: require('./personal/account/conversation.html'),
        messaging: require('./communication/messaging.html'),
        teamIntro: require('./communication/team-intro.html'),
        officeHours: require('./communication/office-hours.html'),
        otherSettings: require('./communication/other-settings.html'),
        appearance: require('./communication/appearance.html'),
        attributes: require('./app-data/attributes.html'),
        tagsSegments: require('./app-data/tagsSegments.html')
    };

    if (!STAGE_OR_PROD) {
        angular.merge(templates, {
            billing: require('./general/billing.html'),
            integrations: require('./general/integrations.html'),
            web: require('./installation/web.html'),
            ios: require('./installation/ios.html'),
            android: require('./installation/android.html')
        });
    }

    module
        .config(function routerConfig($stateProvider) {
            'ngInject';

            $stateProvider
                .state('settings', {
                    url: '/settings',
                    views: {
                        'secondmenu': {
                            template: '<settings-nav></settings-nav>'
                        },
                        '': {
                            templateUrl: templates.index
                        }
                    },
                    redirectTo: 'settings.general',
                    data: {
                        permissions: {
                            only: 'isAuthorized',
                            redirectTo: 'login'
                        }
                    }
                })
                .state('settings.general', {
                    url: '/general',
                    templateUrl: templates.general,
                    controller: require('./general/generalCtrl'),
                    controllerAs: 'ctrl'
                })
                .state('settings.teammates', {
                    url: '/teammates',
                    templateUrl: templates.teammates,
                    controller: require('./general/teammatesCtrl'),
                    controllerAs: 'ctrl'
                })
                .state('settings.account', {
                    url: '/account',
                    templateUrl: templates.tabs,
                    redirectTo: 'settings.account.profile',
                    controllerAs: 'ctrl',
                    controller: function () {
                        this.tabs = [
                            {
                                state: 'settings.account.profile',
                                title: 'Profile'
                            },
                            {
                                state: 'settings.account.notification',
                                title: 'Notifications'
                            },
                            {
                                state: 'settings.account.conversation',
                                title: 'Conversation'
                            }
                        ];
                    }
                })
                .state('settings.account.profile', {
                    url: '/profile',
                    templateUrl: templates.profile,
                    controller: require('./personal/account/profileCtrl'),
                    controllerAs: 'ctrl',
                    data: {
                        modelKey: 'Profile'
                    }
                })
                .state('settings.account.change-password', {
                    url: '/change-password',
                    templateUrl: templates.changePassword,
                    controller: require('./personal/change-password/changePasswordCtrl'),
                    controllerAs: 'ctrl'
                })
                .state('settings.account.notification', {
                    url: '/notification',
                    templateUrl: templates.notification,
                    controller: require('./personal/account/notificationCtrl'),
                    controllerAs: 'ctrl',
                    data: {
                        modelKey: 'ProfileNotifications'
                    }
                })
                .state('settings.account.conversation', {
                    url: '/conversation',
                    templateUrl: templates.conversation,
                    controller: require('./settingsCommonCtrl'),
                    controllerAs: 'ctrl',
                    data: {
                        modelKey: 'ProfileConversation'
                    }
                })
                .state('settings.messaging', {
                    url: '/messaging',
                    templateUrl: templates.tabs,
                    redirectTo: 'settings.messaging.messaging',
                    controllerAs: 'ctrl',
                    controller: function () {
                        this.tabs = [
                            {
                                state: 'settings.messaging.messaging',
                                title: 'Messaging'
                            }
                        ];
                        if (!STAGE_OR_PROD) {
                            this.tabs.push({
                                state: 'settings.messaging.routing',
                                title: 'Routing'
                            });
                        }
                    }
                })
                .state('settings.messaging.messaging', {
                    url: '/messaging',
                    templateUrl: templates.messaging,
                    controller: require('./communication/messagingCtrl'),
                    controllerAs: 'ctrl'
                })
                .state('settings.app-messenger', {
                    url: '/app-messenger',
                    params: {
                        smartCampaign: false,
                        one_time: false,
                        messageCampaign: false,
                        campName: ''
                    },
                    resolve: {
                        currentUser: (Profile) => {
                            return Profile.get();
                        }
                    },
                    templateUrl: templates.tabsAppMessenger,
                    redirectTo: 'settings.app-messenger.team-intro',
                    controller: require('./communication/appMessengerCtrl'),
                    controllerAs: 'ctrl'
                })
                .state('settings.app-messenger.team-intro', {
                    url: '/team-intro',
                    templateUrl: templates.teamIntro
                })
                .state('settings.app-messenger.office-hours', {
                    url: '/office-hours',
                    templateUrl: templates.officeHours
                })
                .state('settings.app-messenger.other-settings', {
                    url: '/other-settings',
                    templateUrl: templates.otherSettings
                })
                .state('settings.appearance', {
                    url: '/appearance',
                    controller: require('./communication/appearanceCtrl'),
                    controllerAs: 'ctrl',
                    templateUrl: templates.appearance
                })
                .state('settings.tags-segments', {
                    url: '/tags-segments',
                    templateUrl: templates.tagsSegments,
                    controller: require('./app-data/tagsSegmentsCtrl'),
                    controllerAs: 'ctrl',
                    redirectTo: 'settings.tags-segments.contacts-segments'
                })
                .state('settings.tags-segments.contacts-segments', {
                    url: '/contacts-segments',
                    data: {
                        type: 'contacts'
                    }
                })
                .state('settings.tags-segments.company-segments', {
                    url: '/company-segments',
                    data: {
                        type: 'companies'
                    }
                })
                .state('settings.tags-segments.tags', {
                    url: '/tags',
                    data: {
                        type: 'tags'
                    }
                })
                .state('settings.attributes-events', {
                    url: '/attributes-events',
                    templateUrl: templates.tabs,
                    redirectTo: 'settings.attributes-events.attributes',
                    controllerAs: 'ctrl',
                    controller: function () {
                        this.tabs = [
                            {
                                state: 'settings.attributes-events.attributes',
                                icon: 'fa-users',
                                title: 'Attributes'
                            }
                        ];
                    }
                })
                .state('settings.attributes-events.attributes', {
                    url: '/attributes',
                    templateUrl: templates.attributes,
                    controller: require('./app-data/attributesCtrl'),
                    controllerAs: 'ctrl'
                });

            if (!STAGE_OR_PROD) {
                $stateProvider
                    .state('settings.billing', {
                        url: '/billing',
                        templateUrl: templates.billing
                    })
                    .state('settings.integrations', {
                        url: '/integrations',
                        templateUrl: templates.integrations,
                        controller: require('./general/integrationsCtrl'),
                        controllerAs: 'ctrl'
                    })
                    .state('settings.web', {
                        url: '/web',
                        templateUrl: templates.web
                    })
                    .state('settings.ios', {
                        url: '/ios',
                        templateUrl: templates.ios
                    })
                    .state('settings.android', {
                        url: '/android',
                        templateUrl: templates.android
                    });
            }
        });
};
