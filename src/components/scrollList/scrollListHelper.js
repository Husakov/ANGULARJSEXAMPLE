module.exports = function (module) {
    module
        .factory('ScrollListHelper', function ($q) {
            'ngInject';

            class ScrollListHelper {
                constructor({fetch, ready}) {
                    this.loading = false;
                    this.allLoaded = false;
                    this.items = [];
                    this.total_count = 0;
                    this.checkedItems = [];
                    this.hasChecked = false;
                    this.searchParams = {};
                    this.sortingBy = '';

                    _.assign(this, {fetch, ready})
                }

                search(params) {
                    this.resetItems({
                        searchParams: angular.copy(params)
                    });
                }

                loadMore() {
                    if (!this.canFetch()) {
                        return;
                    }
                    this._loadItems()
                        .then(items => {
                            this.items.push(...items);
                            this.loading = false;
                            this.total_count = items.total_count;
                            if (this.items.length >= items.total_count) {
                                this.allLoaded = true;
                            }
                        });
                }

                _loadItems() {
                    this.loading = true;
                    return $q((resolve, reject) => {
                        let params = angular.merge({}, {
                            skip: this.items.length
                        }, this.searchParams);
                        this.cancelLastRequest = () => {
                            reject('reset');
                            this.cancelLastRequest = null;
                        };
                        this.fetch({params})
                            .then(resolve);
                    })
                        .catch(err => {
                            if (err === 'reset') {
                                return this._loadItems();
                            } else {
                                return $q.reject(err);
                            }
                        })
                        .then(items => {
                            this.cancelLastRequest = null;
                            return items;
                        });
                }

                resetItems({searchParams} = {}) {
                    _.assign(this, {
                        loading: false,
                        allLoaded: false,
                        items: [],
                        checkedItems: [],
                        hasChecked: false,
                        searchParams: {}
                    }, {
                        searchParams
                    });
                    if (this.cancelLastRequest) {
                        this.cancelLastRequest();
                    } else {
                        this.loadMore();
                    }
                }

                toggleElement(item) {
                    let isChecked = this.checkedItems.indexOf(item) > -1;
                    if (isChecked) {
                        _.pull(this.checkedItems, item);
                    } else {
                        this.checkedItems.push(item);
                    }
                    this.hasChecked = this.checkedItems.length > 0;
                    item.checked = !isChecked;
                }

                checkAll() {
                    this.clearSelection();
                    this.items
                        .forEach(item => {
                            this.toggleElement(item)
                        });
                }

                clearSelection() {
                    this.checkedItems
                        .forEach(item => {
                            item.checked = false;
                        });
                    this.checkedItems.splice(0, this.checkedItems.length);
                    this.hasChecked = false;
                }

                canFetch() {
                    return !(this.loading || this.allLoaded) && this.ready();
                }

                removeFromList(items) {
                    if (!angular.isArray(items)) {
                        items = [items];
                    }
                    items.forEach(item => {
                        let index = _.findIndex(this.items, {id: item.id});
                        if (index !== -1) {
                            this.items.splice(index, 1)
                        }
                        item.checked = false;
                        index = _.findIndex(this.checkedItems, {id: item.id});
                        if (index !== -1) {
                            this.checkedItems.splice(index, 1)
                        }
                    });
                    this.hasChecked = this.checkedItems.length > 0;
                }

                insertTo(item, indexTo) {
                    let index = _.findIndex(this.items, {id: item.id});
                    if (index !== indexTo) {
                        if (index !== -1) {
                            this.items.splice(index, 1)
                        }
                        this.items.splice(indexTo, 0, item);
                    }
                }
            }

            return ScrollListHelper;
        });
};
