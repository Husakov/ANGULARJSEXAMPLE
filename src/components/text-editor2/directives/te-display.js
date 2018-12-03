module.exports = function (mod) {

    mod
        .directive('teDisplay', function ($compile) {
            'ngInject';
            return {
                scope: {
                    toolScope: '=teDisplay'
                },
                link: function ($scope, $element) {
                    const toolScope = $scope.toolScope;
                    const template = toolScope.display;
                    $element.append($compile(template)(toolScope));
                    _.result(toolScope, 'init');
                }
            };
        });
};
