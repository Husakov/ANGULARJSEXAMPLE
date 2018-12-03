module.exports = function (mod) {
    mod.directive('textEditorAttributesFixer', function (textEditorElementsHelper, $timeout) {
        'ngInject';

        const DATA_ATTR = textEditorElementsHelper.dataParser.DATA_ATTR;

        function setAttributesStates($element) {
            $timeout(() =>
                $element
                    .find(`[${DATA_ATTR}]`)
                    .each((i, el) => {
                        let $el = angular.element(el),
                            {attributes} = textEditorElementsHelper.getData($el);
                        $el.attr(attributes || {});
                    })
            );
        }

        return {
            restrict: 'A',
            require: '^ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                $scope.$watch(() => ngModel.$viewValue, () => {
                    setAttributesStates($element);
                });
            }
        };
    });
};
