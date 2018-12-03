module.exports = function (module) {
    module
        .factory('messagesMessageRulesDataHelper', function (EmailTemplate, $q) {
            'ngInject';

            class DataHelper {
                constructor() {
                    this.data = {
                        channels,
                        types,
                        styleTypes,
                        replyTypes,
                        appearances,
                        previewTypes,
                        targetTypes,
                        platforms,
                        daysOfWeek,
                        optionTabs,
                        emailTemplates: EmailTemplate.list()
                    };

                    this.ready = $q.all(
                        Object.keys(this.data)
                        .map(k => {
                            let v = this.data[k];
                            return $q.when(v.$promise || v);
                        })
                    );
                }

                get(name) {
                    let result = this.data[name];
                    if (result && result.$promise) {
                        let data = result;
                        if (angular.isArray(result)) {
                            result = [];
                            data.$promise
                                .then(list => result.push(...list));
                        } else {
                            result = {};
                            data.$promise
                                .then(item => angular.copy(item, result))
                        }
                    } else {
                        result = angular.copy(result);
                    }

                    return result;
                }
            }

            const channels = [
                {
                    name: 'web',
                    title: 'In-app message',
                    icon: 'fa-comment-o'
                },
                {
                    name: 'mobile_and_web',
                    title: 'Push Notification',
                    icon: 'fa-envelope-o'
                },
                {
                    name: 'email',
                    title: 'Email message',
                    icon: 'fa-envelope-o'
                }
            ];

            const types = [
                {
                    name: 'in-app',
                    title: 'In-app message',
                    icon: 'fa-comment-o'
                },
                {
                    name: 'email',
                    title: 'Email message',
                    icon: 'fa-envelope-o'
                },
                {
                    name: 'push',
                    title: 'Push Notification',
                    icon: 'fa-rss'
                }
            ];

            const styleTypes = [
                {
                    name: 'borderless',
                    title: 'Borderless chat',
                    icon: 'fa-comment-o'
                },
                {
                    name: 'chat',
                    title: 'Chat',
                    icon: 'fa-comment-o'
                },
                {
                    name: 'small-announcement',
                    title: 'Note',
                    icon: 'fa-bell-o'
                },
                {
                    name: 'announcement',
                    title: 'Takeover',
                    icon: 'fa-bullhorn'
                }
            ];

            const replyTypes = [
                {
                    name: 'text',
                    title: 'Text',
                    icon: 'fa-commenting-o'
                },
                {
                    name: 'reactions',
                    title: 'Reactions',
                    icon: 'fa-smile-o'
                },
                {
                    name: 'email',
                    title: 'Email Capture Box',
                    icon: 'fa-envelope-o'
                }
            ];

            const appearances = [
                {
                    name: 'badge',
                    title: 'Badge',
                    icon: 'fa-commenting-o'
                },
                {
                    name: 'summary',
                    title: 'Snippet',
                    icon: 'fa-smile-o'
                },
                {
                    name: 'full',
                    title: 'Full Message',
                    icon: 'fa-smile-o'
                }
            ];

            const previewTypes = [
                {name: 'desktop', title: 'Desktop', icon: 'fa-tv'},
                {name: 'ios', title: 'iOS', icon: 'fa-apple'},
                {name: 'android', title: 'Android', icon: 'fa-android'}
            ];

            const targetTypes = [
                {title: 'Where a page URL is ', type: 'equals'},
                {title: 'Where a page URL contains', type: 'contains'},
                {title: 'Where a page URL maches regex', type: 'regex'}
            ];

            const platforms = [
                {title: 'Any platform', id: 'any_platform', icon: 'fa-mobile'},
                {title: 'iOS',          id: 'ios',          icon: 'fa-apple'},
                {title: 'Android',      id: 'android',      icon: 'fa-android'},
                {title: 'Web',          id: 'web',          icon: 'fa-globe'}
            ];

            const daysOfWeek = [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday'
            ];

            const optionTabs = [
                {
                    title: 'Stopdate',
                    alias: 'stopdate',
                    icon: 'fa-calendar-times-o'
                },
                {
                    title: 'Schedule',
                    alias: 'schedule',
                    icon: 'fa-clock-o'
                },
                {
                    title: 'First Message Delivery',
                    alias: 'deliveryChanel',
                    icon: 'fa-laptop'
                },
                {
                    title: 'Target Page',
                    alias: 'target',
                    icon: 'fa-crosshairs'
                },
                {
                    title: 'Delivery window',
                    alias: 'deliveryWindow',
                    icon: 'fa-clock-o'
                },
                // TODO: https://app.asana.com/0/511501667962646/701095848789058
                // {
                //     title: 'Goal',
                //     alias: 'goal',
                //     icon: 'fa-crosshairs'
                // },
                {
                    title: 'Unsubscribe',
                    alias: 'unsubscribe',
                    icon: 'fa-envelope-o'
                }
            ];

            return new DataHelper();
        });
};
