module.exports = function (module) {
    module
        .factory('giphy', function ($resource, $cacheFactory) {
            'ngInject';
            const cache = $cacheFactory('giphy');

            const api_key = 'dc6zaTOxFJmzC';
            const baseUrl = 'http://api.giphy.com/v1/gifs/';


            function transformResponse(response) {
                response = angular.fromJson(response);
                if (_.has(response.pagination, 'total_count')) {
                    response.data.total_count = response.pagination.total_count;
                }
                return response.data;
            }

            return $resource(baseUrl, {api_key: api_key}, {
                query: {
                    method: 'GET',
                    url: baseUrl + 'trending',
                    transformResponse,
                    isArray: true,
                    cache: cache
                },
                search: {
                    method: 'GET',
                    url: baseUrl + 'search',
                    transformResponse,
                    isArray: true,
                    cache: cache
                }
            });
        });
};