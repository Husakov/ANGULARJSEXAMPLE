module.exports = function (mod) {
    mod.run(function run($urlRouter, $rootScope, $state, $timeout, permissions) {
        'ngInclude';

        function reload() {
            $state.reload();
        }

        $rootScope.$on('login', () => reload());
        $rootScope.$on('logout', () => reload());

        $rootScope.$on('$stateChangePermissionAccepted', function (evt, to, params) {
            if (to.redirectTo) {
                evt.preventDefault();
                $timeout(() => {
                    $state.go(to.redirectTo, params, {location: 'replace'})
                });
            }
        });

        permissions.initUserPermissions();

        $urlRouter.sync();
        $urlRouter.listen();

    });
};