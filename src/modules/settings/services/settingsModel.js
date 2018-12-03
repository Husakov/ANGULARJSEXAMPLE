module.exports = function (module) {
    module
        .factory('SettingsModel', function (Profile, ProfileNotifications, ProfileConversation) {
            'ngInject';

            let resources = {
                Profile,
                ProfileNotifications,
                ProfileConversation
            };

            return function (type) {
                return resources[type].get();
            }
        });
};
