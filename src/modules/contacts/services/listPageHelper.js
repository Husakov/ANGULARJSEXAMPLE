module.exports = function (module) {
    module
        .factory('contactsListPageHelper', function (Segment, predicatesHelper, dialogs, notifier, $state, $q) {
            'ngInject';
            let segments = {
                companies: Segment.query({is_company: true}),
                users: Segment.query({is_company: false})
            };

            function isCompanies(mode) {
                return mode === 'companies';
            }

            function getSegments(mode) {
                return isCompanies(mode) ? segments.companies : segments.users;
            }

            function getSegment(segmentId, mode) {
                return getSegments(mode).$promise
                    .then(segments => {
                        return _.find(segments, s => s.id === segmentId);
                    })
                    .then(segment => {
                        return segment ? segment : $q.reject();
                    })
                    .catch(() => {
                        return getDefaultSegment(mode)
                            .then(segment => {
                                return $q.reject({
                                    type: 'segment',
                                    segmentId: segment.id
                                });
                            })
                    });
            }

            function getDefaultSegment(mode) {
                return getSegments(mode).$promise
                    .then(segments => {
                        return segments[0];
                    });
            }

            function redirect(params) {
                $state.go('.', params);
            }

            class ListPageHelper {
                getNewValidParamsObject(params) {
                    let {mode, segmentId, predicates} = params,
                        segmentPromise = getSegment(segmentId, mode),
                        predicatePromise = $q((resolve, reject) => {
                            if (predicates) {
                                try {
                                    predicates = angular.fromJson(predicates);
                                    resolve(predicates)
                                } catch (e) {
                                    reject({type: 'predicates'});
                                }
                            } else {
                                resolve();
                            }
                        });

                    return $q.all([segmentPromise, predicatePromise])
                        .then(([segment, predicates]) => {
                            if (predicatesHelper.isPredicatesEqual(predicates, segment.predicates) || _.isEqual(predicates, [])) {
                                return $q.reject({type: 'predicates'});
                            } else {
                                return [segment, predicates];
                            }

                        })
                        .then(([segment, predicates]) => ({
                            params: {
                                mode,
                                segmentId,
                                segment,
                                predicates: angular.copy(predicates || segment.predicates)
                            },
                            segments: getSegments(mode),
                            isNewPredicates: !!predicates
                        }))
                        .catch(error => {
                            switch (error.type) {
                                case 'segment':
                                    params.segmentId = error.segmentId;
                                    break;
                                case 'predicates':
                                    params.predicates = null;
                                    break;
                                default:
                                    params = {mode};
                                    break;
                            }
                            redirect(params);
                            return $q.reject();
                        })
                }

                isCompanies(mode) {
                    return isCompanies(mode);
                }

                saveSegment(segment, isCompanies) {
                    dialogs
                        .createSegment(
                            isCompanies,
                            segment
                        )
                        .then((segment) => {
                            notifier.success('Segment was successfully created!');
                            segments = {
                                companies: Segment.query({is_company: true}),
                                users: Segment.query({is_company: false})
                            };
                            return $q.all([segments.companies.$promise, segments.users.$promise])
                                .then(() => segment);
                        })
                        .then(segment => {
                            redirect({segmentId: segment.id});
                        });
                }

                reloadSegments(mode) {
                    Segment.clearCache();
                    segments = {
                        companies: Segment.query({is_company: true}),
                        users: Segment.query({is_company: false})
                    };
                    return $q.all([segments.companies.$promise, segments.users.$promise]).then(([companies, users]) => {
                        return isCompanies(mode) ? companies : users;
                    });
                }

                isPredicatesEqual(predicatesA, predicatesB) {
                    return predicatesHelper.isPredicatesEqual(predicatesA, predicatesB);
                }
            }

            return new ListPageHelper();
        });
};
