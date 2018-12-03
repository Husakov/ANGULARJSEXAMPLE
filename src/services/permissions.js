module.exports = function (module) {
    module
        .factory('permissions', function (PermPermissionStore, auth) {
            'ngInject';
            function isAuthorized() {
                return auth.isAuthorized();
            }

            return {
                initUserPermissions: function () {
                    PermPermissionStore.clearStore();

                    PermPermissionStore.definePermission('isAuthorized', isAuthorized);
                },
                isAuthorized

            };
        });
};
