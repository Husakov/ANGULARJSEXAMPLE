module.exports = function (module) {
    module
        .factory('Users', (AuthResource, $q, Tags, Segment, Companies, Profile, $injector) => {
            'ngInject';

            function getDeps(items, isArray) {

                let company_ids = _.uniq(_.flatten(_.pluck(items, 'company_ids')));

                let promises = {
                    tags: Tags.query().$promise,
                    segments: Segment.query({is_company: false}).$promise,
                    currentUser: Profile.get().$promise,
                    companies: Companies.getByIds(company_ids).$promise
                };

                return $q.all(promises)
                    .then((values) => {
                        if (!isArray) {
                            let Events = $injector.get('Events');
                            items.forEach((user) => {
                                values[user.id] = Events.query({
                                    user_id: user.id,
                                    limit: 10,
                                    timeline_type: 'events',
                                    include_count: true
                                }).$promise;
                            });
                        }
                        return $q.all(values);
                    })
            }

            function prepare(user, values) {
                let {tags, segments, currentUser, companies} = values,
                    events = values[user.id];
                user.tags = _.filter(tags, (tag) => {
                    return _.includes(user.tag_ids, tag.id);
                });

                user.visibleTags = _.filter(user.tags, (tag) => {
                    return _.includes(currentUser.visible_tag_ids, tag.id);
                });

                user.segments = _.filter(segments, (segment) => {
                    return _.includes(user.segment_ids, segment.id);
                });

                user.visibleSegments = _.filter(user.segments, (segment) => {
                    return _.includes(currentUser.visible_segment_ids, segment.id);
                });

                user.companies = _.filter(companies, (comp) => {
                    return _.includes(user.company_ids, comp.id);
                });

                if (events) {
                    user.events = events.events;
                }

                if (user.name) {
                    user.initials = user.name
                        .split(' ')
                        .map(w => w.charAt(0).toUpperCase())
                        .join('');
                } else {
                    user.initials = user.display_as.charAt(0).toUpperCase();
                }
            }

            function prepareInterceptor(action, key) {
                let keysToPrepare = ['query', 'get', 'save', 'update', 'search'];
                if (keysToPrepare.includes(key)) {
                    AuthResource.interceptAction(action, {
                        response: function (response) {
                            let isArray = _.isArray(response),
                                resources = isArray ? response : [response];

                            return getDeps(resources, isArray)
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

            let UserResource = AuthResource.decorate([prepareInterceptor]);

            return UserResource('user/:id', {id: '@id'}, {
                search: {
                    method: 'POST',
                    url: 'user/search',
                    isArray: true
                },
                update_tags: {
                    method: 'POST',
                    url: 'user/update_tags'
                },
                bulk_tag: {
                    method: 'POST',
                    url: 'user/bulk_tag'
                },
                bulk_tags: {
                    method: 'POST',
                    url: 'user/bulk_tags'
                },
                bulkDelete: {
                    method: 'POST',
                    url: 'user/bulk_delete'
                }
            });
        });
};
