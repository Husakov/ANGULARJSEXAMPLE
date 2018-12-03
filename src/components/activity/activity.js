module.exports = function (module) {
    require('./activity.scss');

    const templateUrl = require('./index.html');

    class Controller {

        constructor(activityHelper, $scope) {
            'ngInject';

            this.helper = activityHelper;
            this.$scope = $scope;

            this.$scope.$watch(() => this.section_type, () => {
                this.setActivityTypes();
            });
        }

        $onChanges() {
            this.setActivityTypes();
        }

        setParams() {
            let {user_id, author_id, company_id} = this,
                params = _.pick({user_id, author_id, company_id}, _.identity);
            if (!(user_id || author_id || company_id)) {
                delete this.params;
                return;
            }
            if (this.selectedActivityType.type) {
                params.timeline_type = this.selectedActivityType.type;
            }
            if (!angular.equals(this.params, params)) {
                this.params = angular.copy(params);
                this.$scope.$broadcast('scroll-list.reset');
            }
        }

        setActivityTypes() {
            if (this.author_id) {
                this.activityTypes = angular.copy(this.helper.activityMainTypes);
            } else {
                this.activityTypes = angular.copy(this.helper.activityIndividualTypes);
            }

            let selectedType =  _.find(this.activityTypes, {type: this.section_type});

            if (!selectedType) {
                selectedType = this.activityTypes[0];
            }

            this.setActivityFilter(selectedType);
        }

        setActivityFilter(activityType) {
            this.selectedActivityType = activityType;
            this.section_type = activityType.type;
            this.setParams();
        }

        refresh() {
            this.$scope.$broadcast('scroll-list.reset');
        }

        fetch(helperParams) {
            return this.helper.getList(angular.merge({}, this.params, helperParams));
        }
    }

    module
        .component('activity', {
            templateUrl: templateUrl,
            controller: Controller,
            bindings: {
                section_type: '=?sectionType',
                user_id: '<?userId',
                author_id: '<?authorId',
                company_id: '<?companyId'
            }
        });
};
