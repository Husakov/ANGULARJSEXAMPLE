module.exports = function (module) {
    module
        .factory('Attributes', function (AuthResource, $cacheFactory) {
            'ngInject';
            let attributesCache = $cacheFactory('attributesCache');

            let Attributes = AuthResource('attribute', {id: '@id'}, {
                query: {
                    method: 'GET',
                    params: {limit: 0},
                    isArray: true,
                    cache: attributesCache
                }
            });

            Attributes.clearCache = () => {
                attributesCache.removeAll();
            };

            return Attributes;
        });
};
