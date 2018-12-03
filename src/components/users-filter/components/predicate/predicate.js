module.exports = function (module) {
    require('./predicate.scss');

    function getInputTypeTemplate(templates) {
        let result = {};
        templates
            .forEach(
                name => result[name] = require(`./inputTypes/${name}.html`)
            );
        return result;
    }

    const inputTemplates = getInputTypeTemplate(['input', 'dropdown', 'date']);

    class Controller {
        constructor(UsersFilterComparisonHelper, $scope) {
            'ngInject';
            this.helper = new UsersFilterComparisonHelper(this.attribute);
            this.$scope = $scope;

            this.debounceDelay = 500;
        }

        $onInit() {
            this.$scope.$watch(() => this.predicate, () => {
                this.onPredicateChanged();
            }, true);
            this.helper.on('changed', () => this.onComparisonChanged());
            this.onPredicateChanged();
        }

        onPredicateChanged() {
            if (this.predicate.comparison) {
                this.helper.setComparisonByPredicate(this.predicate);
            }
        }

        onComparisonChanged() {
            let comparison = this.helper.comparison;
            this.predicate.comparison = comparison.name;
            this.inputType = this.helper.getInputType(this.inputType);
            if (!this.inputType) {
                this.predicate.value = null;
            } else {
                this.inputType.template = inputTemplates[this.inputType.template];

                if (this.inputType.transform) {
                    this.predicate.value = this.inputType.transform(this.predicate.value);
                }
            }
            if (angular.isDefined(comparison.value)) {
                this.predicate.value = angular.copy(comparison.value);
            }
        }

        remove() {
            this.usersFilter.removePredicate(this.predicate);
        }
    }

    module.component('usersFilterPredicate', {
        templateUrl: require('./index.html'),
        controller: Controller,
        require: {
            usersFilter: '^'
        },
        bindings: {
            predicate: '=',
            attribute: '=',
            disabled: '=?',
            isOrRule: '<',
            togglePredicatesRule: '&?'
        }
    });
};
