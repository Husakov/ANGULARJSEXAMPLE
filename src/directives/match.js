module.exports = function (module) {
    module
        .directive('match', function ($parse) {
            'ngInject';

            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elem, attrs, ngModel) {
                    let matchGetter = $parse(attrs.match);

                    scope.$watch(getMatchValue, function () {
                        ngModel.$$parseAndValidate();
                    });

                    ngModel.$validators.match = function (modelValue, viewValue) {
                        let value = modelValue || viewValue,
                            match = getMatchValue();

                        return value === match;
                    };

                    function getMatchValue() {
                        let match = matchGetter(scope);
                        if (angular.isObject(match) && match.hasOwnProperty('$viewValue')) {
                            match = match.$viewValue;
                        }
                        return match;
                    }
                }
            };
        });
};
