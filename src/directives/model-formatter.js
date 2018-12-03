module.exports = function (module) {
    module
        .directive('modelFormatter', function ($parse) {
            'ngInject';

            return {
                require: '^ngModel',
                link: function ($scope, $element, $attrs, ngModel) {
                    let formatter = $parse($attrs.modelFormatter)($scope);
                    if (!formatter) {
                        return;
                    }

                    if (formatter.$formatters) {
                        ngModel.$formatters.push(...formatter.$formatters);
                    }

                    if (formatter.$parsers) {
                        ngModel.$parsers.push(...formatter.$parsers);
                    }
                    if (formatter.$validators) {
                        angular.merge(ngModel.$validators, formatter.$validators);
                    }
                }
            };
        });
};
