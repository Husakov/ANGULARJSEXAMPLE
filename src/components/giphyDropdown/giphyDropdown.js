let templateUrl = require('./index.html');
require('./giphyDropdown.scss');

class Controller {

    constructor(giphy, $element, $scope) {
        'ngInject';
        this.resource = giphy;
        this.$element = $element;
        this.$scope = $scope;
        $element.addClass('inline');
        this.search = '';
        this.limit = 14;
        this.lastMethod = 'query';

        $scope.$watch(() => this.search, () => this.getResults());
    }

    getResults() {
        if (this.open) {
            this.$scope.$broadcast('scroll-list.reset');
            if (this.search.length) {
                this.lastMethod = 'search';
            } else {
                this.lastMethod = 'query';
            }
            this.listHelper.loadMore();
        }
    }

    load({skip}) {
        let params = {
            limit: this.limit,
            offset: skip
        };
        if (this.lastMethod === 'search') {
            params.q = this.search;
        }
        return this.resource[this.lastMethod](params).$promise;
    }

    select(gif) {
        this.open = false;
        this.onSelect({gif: gif});
    }
}

module.exports = angular.module('intercom.components.giphyDropdown', [])
    .component('giphyDropdown', {
        templateUrl: templateUrl,
        controller: Controller,
        bindings: {
            onSelect: '&'
        }
    });
