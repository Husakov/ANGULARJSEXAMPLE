module.exports = function (module) {
    module
        .factory('UploadResource', (AuthResource, Uploader) => {
            'ngInject';

            let resource = AuthResource('upload/:id', {id: '@id'}),
                uploader = new Uploader('upload');

            resource.save = function (file) {
                let promise = uploader.addToQueue(file),
                    result = {};
                uploader.uploadAll();

                result.$promise = promise.then(response => {
                    angular.merge(result, response);
                    return result;
                });

                return result;
            };

            resource.cancel = function (file) {
                return uploader.cancel(file);
            };

            return resource;
        });
};
