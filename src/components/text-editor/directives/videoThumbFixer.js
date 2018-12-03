module.exports = function (mod) {
    mod.directive('textEditorVideoThumbFixer', function (textEditorElementsHelper, mnhVideoUtils, $timeout) {
        'ngInject';


        function setVideoThumbs($element) {
            $timeout(() =>
                $element
                    .find(`.video-thumb`)
                    .each((i, el) => {
                        let $el = angular.element(el),
                            {data} = textEditorElementsHelper.getData($el),
                            {provider, id} = data,
                            videoInfo = mnhVideoUtils.getInfoByProvider(provider, id);
                        if (videoInfo) {
                            videoInfo.getThumbUrl()
                                .then(thumbUrl => {
                                    $el.css('background-image', `url(${thumbUrl})`);
                                });
                        }

                    })
            );
        }

        return {
            restrict: 'A',
            require: '^ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                $scope.$watch(() => ngModel.$viewValue, () => {
                    setVideoThumbs($element);
                });
            }
        };
    });
};
