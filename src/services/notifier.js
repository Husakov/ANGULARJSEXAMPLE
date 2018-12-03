module.exports = function (module) {
    module
        .config(function (NotificationProvider) {
            'ngInject';

            NotificationProvider.setOptions({
                delay: 5000,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'center',
                positionY: 'top'
            });
        })
        .factory('notifier', function (Notification) {
            'ngInject';

            return {
                success: function (msg, title) {
                    Notification.success(this.config(title, msg));
                },

                info: function (msg, title) {
                    Notification.info(this.config(title, msg));
                },

                error: function (msg, title) {
                    Notification.error(this.config(title, msg));
                },

                warning: function (msg, title) {
                    Notification.warning(this.config(title, msg));
                },

                config: function (title, msg, delay) {
                    let config = {message: msg, delay: (delay || 5000)};
                    if (title) {
                        config.title = title;
                    }
                    return config;
                }
            };
        });
};
