module.exports = function (module) {
    let baseParams = {
        limit: 25,
        sort: 'last_request_at desc',
        include_count: true
    };

    class Controller {
        constructor(Users, Companies, contactsListPageHelper, pubSub, notifier, dialogs, $state, $scope, $q, slidePanelManager, predicatesHelper) {
            'ngInject';
            this.Users = Users;
            this.Companies = Companies;
            this.helper = contactsListPageHelper;
            this.predicatesHelper = predicatesHelper;
            this.pubSub = pubSub;
            this.notifier = notifier;
            this.dialogs = dialogs;
            this.$state = $state;
            this.$scope = $scope;
            this.$q = $q;

            this.tags = [];
            this.tagPanel = slidePanelManager.render({
                template: '<tag-search done="$ctrl.resolveTags({tags: tags})" existed="$ctrl.tags"></tag-search>',
                background: true,
                slideAppContainer: true,
                $scope: $scope.$new()
            });
            this.tagPanel.on('toggle', ($e, state) => this.tags = state ? this.getSelectedTags() : []);

            this.labels = {
                users: {
                    checked: 'selected users',
                    unchecked: 'all users who match these filters'
                },
                companies: {
                    checked: 'selected companies',
                    unchecked: 'companies, which match these filters'
                }
            };

            this.isFilterOpened = false;
            this.params = null;
            this.predicates = [];
            this.listHelper = null;
            this.searchPredicate = null;
        }

        $onInit() {
            this.setParams(this.$state.params);

            this.pubSub.onStateChanged((event, toState, toParams) => {
                this.setParams(toParams);
            }, this.$scope);

            this.$scope.$watch(() => this.predicates, () => this.predicatesChanged(), true);
        }

        setParams(params) {
            let paramsPromiseCancel = this.paramsPromiseCancel;
            this.paramsPromise = this
                .$q((resolve, reject) => {
                    this.paramsPromiseCancel = () => {
                        reject('reset');
                    };
                    this.helper.getNewValidParamsObject(params)
                        .then(({params, segments, isNewPredicates}) => {
                            this.segments = segments;

                            if (!_.some(params.predicates, this.searchPredicate)) {
                                this.searchPredicate = null;
                                this.$scope.$broadcast('clearSearch');
                            }
                            this.params = params;
                            this.predicates = angular.copy(params.predicates);
                            this.isNewPredicates = isNewPredicates;
                            if (this.isCompanies() && this.mode !== 'company') {
                                this.filterMode = 'company';
                            }
                            this.currentRole = this.predicatesHelper.getPredicatesInfo(this.predicates, {}).mode;
                            return angular.copy(params);
                        })
                        .then(params => resolve(params));
                })
                .catch(err => {
                    if (err === 'reset') {
                        return this.paramsPromise;
                    } else {
                        return this.$q.reject(err);
                    }
                });

            if (paramsPromiseCancel) {
                paramsPromiseCancel();
                this.$scope.$broadcast('scroll-list.reset');
            }

        }

        fetch(helperParams) {
            let isCompanies,
                resource;
            return this.paramsPromise
                .then(_params => {
                    isCompanies = this.isCompanies(_params.mode);
                    resource = isCompanies ? this.Companies : this.Users;

                    let postParams = {predicates: _params.predicates},
                        queryParams = angular.merge({}, baseParams, helperParams);
                    return resource.search(queryParams, postParams).$promise;
                });
        }

        search(predicate) {
            if (!_.isEqual(predicate, this.searchPredicate)) {
                let predicates = this.predicates;

                if (this.searchPredicate) {
                    _.remove(predicates, this.searchPredicate);
                }

                if (predicate) {
                    predicates.push(predicate);
                }

                this.searchPredicate = predicate;
                this.$state.go('.', {predicates: angular.toJson(predicates)});
            }
        }

        isCompanies(mode) {
            mode = mode || _.get(this, 'params.mode', 'users');
            return this.helper.isCompanies(mode);
        }

        predicatesChanged() {
            if (this.helper.isPredicatesEqual(this.predicates, [])) {
                return;
            }
            if (!this.helper.isPredicatesEqual(this.predicates, this.params.predicates)) {
                this.$state.go('.', {predicates: angular.toJson(this.predicates)});
            }
        }

        saveSegment() {
            let segment = {};
            if (this.params.segment) {
                segment = this.params.segment;
                segment.predicates = this.predicates;
            } else {
                segment = {
                    predicates: this.predicates
                }
            }
            this.helper.saveSegment(segment, this.isCompanies());
        }

        setHeaderAttributes(attributes) {
            this.headerAttributes = attributes;
        }

        toggleFilter(state = !this.isFilterOpened) {
            this.isFilterOpened = state;
        }

        getListType() {
            return this.isCompanies() ? 'companies' : 'contacts';
        }

        getLabel() {
            return this.labels[this.isCompanies() ? 'companies' : 'users'][this.listHelper.hasChecked ? 'checked' : 'unchecked'];
        }

        getUserIds() {
            if (this.listHelper && this.listHelper.hasChecked) {
                return this.listHelper.checkedItems.map(item => item.id);
            }
            return null;
        }

        deleteList() {
            const options = this.listHelper.hasChecked ? {
                title: `Delete ${this.getLabel()}`,
                body: `Are you sure about deleting ${this.listHelper.checkedItems.length} ${this.getLabel()}?`
            } : {
                title: 'Delete filtered segment',
                body: `Are you sure about deleting ${this.getLabel()} (${this.listHelper.total_count} items)?`
            };

            this.dialogs
                .confirm(options)
                .then(() => {
                    let resource = this.isCompanies() ? this.Companies : this.Users,
                        options = {};
                    if (this.listHelper.hasChecked) {
                        options = {
                            included_ids: _.pluck(this.listHelper.checkedItems, 'id')
                        };
                    } else {
                        options = {
                            predicates: this.params.predicates
                        };
                    }
                    resource
                        .bulkDelete({}, options)
                        .$promise
                        .then(() => {
                            this.notifier.success('Items were successfully deleted!');
                            this.helper.reloadSegments(this.params.mode).then((segments) => {
                                this.segments = segments;
                            });
                            this.$scope.$broadcast('scroll-list.reset');
                        });
                });
        }

        getSelectedTags() {
            let items = this.listHelper.checkedItems,
                tags;
            if (items.length > 1) {
                tags = _.intersection(..._.map(items, 'tags'));
            } else {
                tags = items[0].tags;
            }
            return tags;
        }

        resolveTags({tags}) {
            let oldTags = _.map(this.tags, 'id'),
                newTags = _.map(tags, 'id'),
                toRemove = _.difference(oldTags, newTags),
                toAdd = _.difference(newTags, oldTags),
                resource = this.isCompanies() ? this.Companies : this.Users,
                options = {};
            this.tagPanel.toggle();

            if (toAdd.length === 0 && toRemove.length === 0) {
                return;
            }

            if (this.listHelper.hasChecked) {
                options.included_ids = _.pluck(this.listHelper.checkedItems, 'id');
            } else {
                options.predicates = this.params.predicates;
            }

            if (toAdd.length > 0) {
                this.paramsPromise = this.paramsPromise
                    .then(
                        params => resource
                            .bulk_tags(angular.merge({}, options, {tag_ids: toAdd, action: 'add'}))
                            .$promise
                            .then(() => params)
                    );
            }

            if (toRemove.length > 0) {
                this.paramsPromise = this.paramsPromise
                    .then(
                        params => resource
                            .bulk_tags(angular.merge({}, options, {tag_ids: toRemove, action: 'delete'}))
                            .$promise
                            .then(() => params)
                    );
            }

            this.$scope.$broadcast('scroll-list.reset');
        }

        openExport() {
            const options = {
                records: this.listHelper.checkedItems,
                recordsType: this.isCompanies() ? 'company' : 'user',
                predicates: this.params.predicates
            };

            this.dialogs
                .CSVExport(options)
                .then(success => {
                    if (success) {
                        this.notifier.success('You will be emailed a CSV. At peak times this can take a few hours')
                    } else {
                        this.notifier.info('Canceled')
                    }
                });
        }
    }

    module
        .controller('ContactsListController', Controller);
};
