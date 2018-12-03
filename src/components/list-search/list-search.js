module.exports = function (mod) {
    const templateUrl = require('./list-search.html');

    require('./list-search.scss');

    const names = {
        tags: 'tag',
        admins: 'admin'
    };

    function getPrefix(type) {
        return names[type] + ': ';
    }

    function getFilter(type, word) {
        return item => item.name && item.name.toLowerCase().indexOf(
            word.toLowerCase().replace(getPrefix(type), '')
        ) !== -1;
    }

    function getType(item) {
        if (item.admins || item.admin) {
            return {type: 'admins', value: item.admins || item.admin};
        } else if (item.tags || item.tag) {
            return {type: 'tags', value: item.tags || item.tag};
        } else if (item.name || item.search) {
            return {type: 'name', value: item.name || item.search};
        }
    }

    class Controller {
        constructor(Tags, Admin, $scope, $q, $element) {
            'ngInject';

            this.$scope = $scope;
            this.Tags = Tags;
            this.Admin = Admin;
            this.$q = $q;

            this.tags = [];
            this.admins = [];

            this.searchWord = this.searchWord || '';
            this.debounceDelay = 500;
            this.isOpen = false;
            this.$searchInput = $element.find('.list-search-input');
        }

        $onInit() {
            let searchLists = angular.merge({}, {
                tags: true,
                admins: false
            }, this.searchBy);
            this.searchByNamesArray = [];
            Object.keys(searchLists)
                .forEach(k => {
                    if (searchLists[k]) {
                        this.searchByNamesArray.push(k);
                    }
                });

            this.$scope.$watch(() => this.currentSearch, () => this.setSearchWord(), true);
            this.$scope.$watch(() => this.searchWord, () => this.onSearchWord());
            this.$scope.$on('clearSearch', () => this.clearSearchInput());
            this.updateLists()
                .then(() => this.setSearchWord());
        }

        updateLists() {
            return this.$q.all(
                this.searchByNamesArray
                    .map(k => this.getList(k))
                    .filter(k => !!k)
            );
        }

        getList(type) {
            let promise;
            switch (type) {
                case 'tags':
                    promise = this.Tags.query({limit: 0}).$promise;
                    break;
                case 'admins':
                    promise = this.Admin.query().$promise;
                    break;
                default:
                    break;
            }
            if (promise) {
                return promise.then(
                    items => this[type] = this.getFilteredItems(items, type)
                );
            }
        }

        getFilteredItems(items, type) {
            return _.filter(
                items,
                getFilter(type, this.searchWord)
            );
        }

        onSearchWord() {
            this.updateLists();
            let type = this.isWordWithListName(this.searchWord);
            if (type) {
                const item = _.find(
                    this[type],
                    getFilter(type, this.searchWord)
                );

                if (item) {
                    this.search({[names[type]]: item.id});
                }
            } else {
                this.search({name: this.searchWord});
            }
        }

        pickItem(type, id, name) {
            this.searchWord = getPrefix(type) + name;

            this.search({[names[type]]: id});
            this.toggle(false);
            this.$searchInput.blur();
        }

        pickWord() {
            this.search({name: this.searchWord});
            this.toggle(false);
            this.$searchInput.blur();
        }

        isWordWithListName(word) {
            return _.find(this.searchByNamesArray, k => word.indexOf(getPrefix(k)) === 0);
        }

        clearSearchInput() {
            this.searchWord = '';
            this.onSearchWord();
        }

        search(data) {
            this.currentSearch = data;
            this.onSearch(data);
        }

        setSearchWord() {
            if (!this.currentSearch) {
                return;
            }
            let typeObj = getType(this.currentSearch),
                searchWord = '';

            if (typeObj) {
                if (typeObj.type !== 'name') {
                    let item = _.find(this[typeObj.type], {id: typeObj.value});
                    if (item) {
                        searchWord = getPrefix(typeObj.type) + item.name;
                    }
                } else {
                    searchWord = typeObj.value;
                }
            }

            this.searchWord = searchWord;
        }

        toggle(state = !this.isOpen) {
            this.isOpen = state;
        }
    }

    mod
        .component('listSearch', {
            templateUrl,
            controller: Controller,
            bindings: {
                onSearch: '&',
                wordPlaceholder: '@?',
                wordIcon: '@?',
                placeholder: '@?',
                searchBy: '<?',
                currentSearch: '=?'
            }
        });
};
