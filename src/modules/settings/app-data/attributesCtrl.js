let baseParams = {
    limit: 25,
    include_count: true,
    sort: 'is_custom desc'
};

module.exports = class Controller {
    constructor($scope, dialogs, Attributes) {
        'ngInject';

        this.resource = Attributes;
        this.$scope = $scope;
        this.dialogs = dialogs;
        this.mode = 'user';

        this.reload();
    }

    createNewAttribute() {
        this.dialogs.editAttribute()
            .then(() => {
                this.reload();
            });
    }

    setParams() {
        if (this.mode === 'user') {
            this.params = angular.merge({is_company: false}, baseParams);
        } else {
            this.params = angular.merge({is_company: true}, baseParams);
        }
    }

    fetch(helperParams) {
        let params = _.assign({}, this.params, helperParams);
        return this.resource.query(params).$promise;
    }

    reload() {
        this.resource.clearCache();
        this.params = null;
        this.listHelper = null;
        this.setParams();
        this.$scope.$broadcast('scroll-list.reset');
    }
};
