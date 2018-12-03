module.exports = function (module) {
    module
        .factory('MessageFolder', (AuthResource) => {
            'ngInject';

            return AuthResource('messagefolder/:id', {id: '@id'});
        });
};