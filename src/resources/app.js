module.exports = function (module) {
    module
        .factory('App', (AuthResource) => {
            'ngInject';
            return AuthResource('app', {}, {
                queryInboxes: {
                    method: 'GET',
                    url: 'app/inboxes',
                    isArray: true
                }
            });
        });
};
