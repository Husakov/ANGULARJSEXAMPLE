module.exports = function (module) {

    const menuItems = {
        auto: {
            items: [
                {
                    title: 'All Messages',
                    icon: 'fa-list',
                    state: 'all',
                    params: {
                        message_type: 'auto'
                    }
                },
                {
                    title: 'All live',
                    icon: 'fa-bolt',
                    state: 'live'
                },
                {
                    title: 'All drafts',
                    icon: 'fa-pencil',
                    state: 'draft'
                },
                {
                    title: 'All paused',
                    icon: 'fa-pause-circle',
                    state: 'stopped'
                },
                {
                    title: 'All scheduled',
                    icon: 'fa-calendar',
                    state: 'scheduled'
                },
                {
                    title: 'My messages',
                    icon: 'fa-user',
                    state: 'my',
                    params: {
                        message_type: 'auto'
                    }
                }
            ]
        },
        manual: {
            items: [
                {
                    title: 'All Messages',
                    icon: 'fa-list',
                    state: 'all',
                    params: {
                        message_type: 'manual'
                    }
                },
                {
                    title: 'Sent',
                    icon: 'fa-bolt',
                    state: 'sent'
                },
                {
                    title: 'Drafts',
                    icon: 'fa-pencil',
                    state: 'draft'
                },
                {
                    title: 'Scheduled',
                    icon: 'fa-pause-circle',
                    state: 'scheduled'
                }
            ]
        }
    };

    module.constant('messagesListMenuItems', menuItems);
};
