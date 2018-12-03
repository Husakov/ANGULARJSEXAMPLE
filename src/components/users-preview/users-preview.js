module.exports = function (module) {
    class Controller {
        constructor(Users, $scope) {
            'ngInject';
            if (this.userIds && this.userIds.length) {
                this.loading = true;
                Users.getByIds(this.userIds).$promise.then((users) => {
                    this.users = users;
                    this.totalCount = this.users.length;
                    this.loading = false;
                });
            } else {
                this.limitTo = this.limitTo || 15;
                this.loading = false;
                $scope.$watch(() => this.predicates, () => {
                    this.loading = true;
                    Users.search({include_count: true, limit: this.limitTo}, {predicates: this.predicates})
                        .$promise
                        .then((users) => {
                            this.users = users;
                            this.totalCount = users.total_count;
                            this.loading = false;
                        });
                });
            }
        }
    }

    module
        .component('usersPreview', {
            templateUrl: require('./index.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                predicates: '<',
                userIds: '<',
                limitTo: '<'
            }
        });
};
