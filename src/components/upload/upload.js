module.exports = function (module) {
    const templateUrl = require('./upload.html');

    module
        .directive('upload', function ($timeout, notifier) {
            'ngInject';

            function addInput($element, onChange, accept) {
                let input = angular.element('<input type="file" style="display: none !important">');

                if (accept) {
                    input.attr('accept', accept);
                }

                $element.append(input);

                input.bind('change', onChange);

                return input;
            }

            function selectFile($scope, file) {
                if ($scope.accept && !validate($scope.accept, file)) {
                    notifier.error(`You must put the valid file type: ${$scope.accept}`);
                    return;
                }

                if ($scope.onRead) {
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        $scope.$apply(function () {
                            $scope.onRead({file: file, content: e.target.result});
                        });
                    };

                    reader.readAsDataURL(file);
                }
                if ($scope.onSelect) {
                    $scope.onSelect({file: file});
                }
            }

            function validate(accept, file) {
                const types = accept.split(',')
                    .map(e => e.trim());
                let result = false;

                types.forEach(t => {
                    if (t.startsWith('.')) {
                        result = result || (new RegExp(t + '$')).test(file.name);
                    } else {
                        result = result || (new RegExp(t)).test(file.type);
                    }

                });
                return result;
            }

            return {
                restrict: 'E',
                require: ['?^uploadFileDrop'],
                scope: {
                    accept: '=?',
                    onSelect: '&',
                    onRead: '&'
                },
                transclude: true,
                templateUrl,
                link: function ($scope, $element, $attrs, fileDropCtrl) {
                    let input = addInput($element, onChange, $scope.accept);

                    $scope.selectFile = function () {
                        $timeout(() => {
                            input.trigger('click');
                        }, 0);
                    };

                    function onChange($event) {
                        selectFile($scope, $event.target.files[0]);

                        input.remove();
                        input = addInput($element, onChange, $scope.accept);
                    }

                    if (fileDropCtrl[0]) {
                        fileDropCtrl[0].onSelect = ({file}) => {
                            selectFile($scope, file);
                        };
                    }
                }
            }
        });
};
