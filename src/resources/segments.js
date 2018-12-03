module.exports = function (module) {
    module
        .factory('Segment', (AuthResource, $cacheFactory, Profile, $q) => {
            'ngInject';

            let segmentsCache = $cacheFactory('segmentsCache');

            const listResponseInterceptor = ({resource}) => {
                let deferred = $q.defer();

                Profile.get().$promise.then(({visible_segment_ids}) => {
                    let filteredSegments = [];

                    if (visible_segment_ids.length) {
                        filteredSegments.push(..._.filter(
                            resource,
                            segment => visible_segment_ids.indexOf(segment.id) !== -1
                        ));
                    }

                    deferred.resolve(filteredSegments);
                });

                return deferred.promise;
            };

            let Segment = AuthResource(
                'segment/:id',
                {id: '@id'},
                {
                    query: {
                        method: 'GET',
                        params: {limit: 0},
                        isArray: true,
                        cache: segmentsCache
                    },
                    filteredList: {
                        method: 'GET',
                        isArray: true,
                        interceptor: {
                            response: listResponseInterceptor
                        }
                    },
                    create: {
                        method: 'POST',
                        url: 'segment'
                    },
                    search: {
                        method: 'POST',
                        url: 'segment/search'
                    }
                }
            );

            Segment.clearCache = () => {
                segmentsCache.removeAll();
            };

            Segment.prototype.icon = function () {
                if (!this.is_editable) {
                    switch (this.name) {
                        case 'All Users':
                        case 'All Visitors':
                            return 'fa-users';
                        case 'New':
                            return 'fa-user';
                        case 'Active':
                            return 'fa-line-chart';
                        case 'Slipping Away':
                            return 'fa-level-down';
                        default:
                            return 'fa-pie-chart';
                    }
                }
            };

            return Segment;
        });
};
