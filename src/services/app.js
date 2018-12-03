module.exports = function (module) {
    module
        .factory('app', function ($injector, $cookies, pubSub) {
            'ngInject';
            let appId = $cookies.get('appId'),
                currentUser;

            function setAppId(id) {
                let expires = new Date();
                expires.setFullYear(2100);
                $cookies.put('appId', id, {path: '/', expires: expires});
                appId = id;
            }

            return {
                init() {
                    currentUser = $injector.get('Profile').get();
                    return currentUser.$promise
                        .then(() => {
                            if (!appId || !currentUser.apps.includes(app => app.id === appId)) {
                                setAppId(currentUser.current_app_id);
                            }
                        })
                        .catch(() => {
                            $cookies.remove('appId');
                        });
                },
                getAppId: function () {
                    return appId;
                },
                setApp(id) {
                    setAppId(id);
                    pubSub.emit('reload');
                }
            };
        });
};
