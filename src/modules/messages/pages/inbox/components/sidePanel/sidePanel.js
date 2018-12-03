module.exports = function (module) {
    let templateUrl = require('./index.html');

    const searchMap = {
         search: 'name',
         tag: 'tag'
    };

    class Controller {
        constructor(inboxesList, inboxHelper, $scope, pubSub, $state) {
            'ngInject';
            this.inboxesList = inboxesList;
            this.inboxHelper = inboxHelper;
            this.$state = $state;
            this.$scope = $scope;

            pubSub.onStateChanged(() => {
                this.inboxOpen = false;
                this.setCurrentSearch();
            }, $scope);

            this.setCurrentSearch();

            let off = $scope.$watch(() => this.listHelper, () => {
                if (this.listHelper) {
                    this.inboxHelper.setListHelper(this.listHelper);
                    off();
                }
            });
        }

        searchConversations(tag, name) {
            let params = _.omit(this.$state.params, ...Object.keys(searchMap));
            if (tag) {
                params.tag = tag;
            }
            if (name) {
                params.search = name;
            }

            this.$state.go('.', params, {inherit: false});
        }

        setCurrentSearch() {
            let params = this.$state.params,
                hasSearch = false;
            this.currentSearch = {};
            Object.keys(searchMap)
                .forEach(k => {
                    let v = params[k];
                    if (v) {
                        this.currentSearch[searchMap[k]] = v;
                        hasSearch = true;
                    }
                });
            if (!hasSearch) {
                this.$scope.$broadcast('clearSearch');
            }
        }
    }

    module
        .component('inboxSidePanel', {
            templateUrl,
            controller: Controller
        });
};
