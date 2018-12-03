module.exports = function (module) {
    let baseParams = {
        limit: 25,
        sort: 'went_live_at desc'
    };

    class Controller {
        constructor(Dispatch, Admin, Team, messagesSectionsHelper, pubSub, $state, $scope, $q) {
            'ngInject';
            this.Dispatch = Dispatch;
            this.messagesSectionsHelper = messagesSectionsHelper;
            this.$scope = $scope;
            this.$q = $q;

            this.admins = Admin.query();
            this.teams = Team.query();

            this._params = null;
            this.listHelper = null;
            this.setParams($state.params);

            pubSub.onStateChanged((event, toState, toParams) => {
                $scope.$broadcast('clearSearch');
                this.setParams(toParams);
            }, $scope);
        }

        setParams({type, role, state}) {
            if (type && role && state && !_.isEqual(this._params, {type, role, state})) {
                this.params = this.messagesSectionsHelper.getParams(type, state)
                    .then(_params => {
                        if (!_params) {
                            return this.$q.reject();
                        }
                        if (this._params) {
                            this.$scope.$broadcast('scroll-list.reset');
                        }
                        this._params = {type, role, state};
                        return angular.merge({}, baseParams, _params, {user_role: role});
                    });
            }
        }

        fetch(helperParams) {
            return this.params
                .then(params => this.Dispatch.query(_.assign({}, params, helperParams)).$promise);
        }

        checkAllToggle() {
            if (this.listHelper.checkedItems.length === this.listHelper.items.length) {
                this.listHelper.clearSelection();
            } else {
                this.listHelper.checkAll();
            }
        }

        getFromPerson(item) {
            let id = item.variations[0].from_id;
            return _.find(this.admins, {id})
                || _.find(this.teams, {id})
                || null;
        }

        isDraft() {
            return _.get(this, '_params.state', null) === 'draft';
        }
    }

    module
        .controller('MessagesListController', Controller);
};
