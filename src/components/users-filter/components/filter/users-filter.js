module.exports = function (module) {
    require('./filter.scss');

    class Controller {
        constructor($scope, attributesHelper, predicatesHelper) {
            'ngInject';
            this.$scope = $scope;
            this.attributesHelper = attributesHelper;
            this.predicatesHelper = predicatesHelper;

            this.attributes = [];
            this.predicates = [];
            this.initAttributes();
            this.setModePredicate();
        }

        $onInit() {
            this.$scope.$watch(
                () => this.predicates,
                () => this.setViewValue(),
                true
            );
            this.$scope.$watch(
                () => this.mode,
                (newMode, oldMode) => {
                    let isCompany = [newMode, oldMode].includes('company');
                    if (isCompany && newMode !== oldMode) {
                        this.initAttributes();
                    }
                    this.setModePredicate();
                    this.setViewValue();
                }
            );

            this.$scope.$watch(
                () => this.modePredicate.comparison,
                () => this.mode = this.modePredicate.comparison
            );

            this.ngModel.$render = () => {
                if (this.ngModel.$viewValue && this.attributesCategories) {
                    this.getViewValue();
                }
            };
        }

        initAttributes() {
            this.attributesHelper.getAttributesByCategories(this.mode)
                .then(categories => {
                    this.attributesCategories = categories;
                    if (this.ngModel.$viewValue) {
                        this.getViewValue();
                    }
                });
        }

        addAttribute(attribute) {
            this.attributes.push(attribute);
            this.predicates.push({
                type: attribute.type,
                value: attribute.type === 'boolean' ? false : null,
                comparison: null,
                attribute: attribute.name
            });
        }

        isValidPredicate(item) {
            return this.predicatesHelper.isValidPredicate(item);
        }

        getPredicateAttribute(predicate) {
            return _.find(this.attributes, 'name', predicate.attribute);
        }

        togglePredicatesRule(predicate) {
            this.predicatesHelper.togglePredicatesRule(this.predicates, predicate);
        }

        removePredicate(predicate) {
            this.predicatesHelper.removePredicate(this.predicates, predicate);
        }

        setViewValue() {
            if (!this.attributesCategories) {
                return;
            }
            let predicates = this.getValidPredicates(),
                result = this.predicatesHelper.combinePredicates({
                    predicates,
                    mode: this.mode
                });
            result.size = predicates.length;
            if (!this.predicatesHelper.isPredicatesEqual(this.ngModel.$viewValue, result)) {
                this.ngModel.$setViewValue(result);
            }
        }

        getViewValue() {
            if (!this.ngModel.$viewValue) {
                return;
            }
            let mode = this.mode,
                value = this.predicatesHelper.combinePredicates({
                    predicates: this.getValidPredicates(),
                    mode
                });
            if (!this.predicatesHelper.isPredicatesEqual(this.ngModel.$viewValue, value)) {
                ({
                    predicates: this.predicates,
                    attributes: this.attributes,
                    mode
                } = this.predicatesHelper.getPredicatesInfo(this.ngModel.$viewValue, this.attributesCategories, mode));
            }
            this.ngModel.$viewValue.size = this.predicates.length;
            if ((mode || this.mode !== 'company') && this.mode !== mode) {
                if (!this.fixedMode) {
                    this.mode = mode;
                } else {
                    this.setModePredicate();
                    this.setViewValue();
                }
            }
        }

        getValidPredicates() {
            return this.predicatesHelper.getValidPredicates(this.predicates);
        }

        setModePredicate() {
            this.modePredicate = this.predicatesHelper.getModePredicate(this.mode);
        }
    }

    module.component('usersFilter', {
        templateUrl: require('./index.html'),
        controller: Controller,
        transclude: {
            left: '?usersFilterLeft',
            right: '?usersFilterRight'
        },
        require: {
            ngModel: '^ngModel'
        },
        bindings: {
            limit: '<?',
            mode: '=?',
            fixedMode: '=?',
            hideMode: '=?'
        }
    });
};
