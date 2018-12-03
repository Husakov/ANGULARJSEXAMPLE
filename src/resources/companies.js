module.exports = function (module) {
    module
        .factory('Companies', (AuthResource, Tags, Segment, Profile, $q, $cacheFactory, $injector) => {
            'ngInject';

            function getDeps() {
                let promises = {
                    tags: Tags.query().$promise,
                    segments: Segment.query({is_company: false}).$promise,
                    currentUser: Profile.get().$promise
                };

                return $q.all(promises);
            }

            function prepare(company, values) {
                let {tags, segments, currentUser} = values;
                company.tags = _.filter(tags, (tag) => {
                    return _.includes(company.tag_ids, tag.id);
                });

                company.visibleTags = _.filter(company.tags, (tag) => {
                    return _.includes(currentUser.visible_tag_ids, tag.id);
                });

                if (company.manual_tag_ids) {
                    company.manual_tags = _.filter(tags, (tag) => {
                        return _.includes(company.manual_tag_ids, tag.id);
                    });
                }

                company.segments = _.filter(segments, (segment) => {
                    return _.includes(company.segment_ids, segment.id);
                });

                company.visibleSegments = _.filter(company.segments, (segment) => {
                    return _.includes(currentUser.visible_segment_ids, segment.id);
                });
            }

            function prepareInterceptor(action, key) {
                let keysToPrepare = ['query', 'get', 'save', 'update', 'search'];
                if (keysToPrepare.includes(key)) {
                    AuthResource.interceptAction(action, {
                        response: function (response) {
                            let resources = _.isArray(response) ? response : [response];

                            return getDeps()
                                .then((depts) => {
                                    resources.forEach(
                                        (item) => prepare(item, depts)
                                    );
                                    return response;
                                });
                        }
                    }, true);
                }
            }

            let companiesCache = $cacheFactory('companiesCache'),
                CompanyResource = AuthResource.decorate([prepareInterceptor], [], {
                    clearCache: function () {
                        companiesCache.removeAll();
                    }
                });

            return CompanyResource('company/:id', {id: '@id'}, {
                query: {
                    method: 'get',
                    isArray: true,
                    cancellable: true,
                    cache: companiesCache
                },
                get: {
                    method: 'get',
                    interceptor: {
                        response: function (response) {
                            let Users = $injector.get('Users');
                            return Users.query({company_ids: response.resource.id})
                                .$promise
                                .then(users => {
                                    response.resource.users = users;
                                    return response;
                                });
                        }
                    }
                },
                search: {
                    method: 'POST',
                    url: 'company/search',
                    isArray: true
                },
                update_tags: {
                    method: 'POST',
                    url: 'company/update_tags'
                },
                bulk_tag: {
                    method: 'POST',
                    url: 'company/bulk_tag'
                },
                bulk_tags: {
                    method: 'POST',
                    url: 'company/bulk_tags'
                },
                bulkDelete: {
                    method: 'POST',
                    url: 'company/bulk_delete'
                }
            });
        });
};
