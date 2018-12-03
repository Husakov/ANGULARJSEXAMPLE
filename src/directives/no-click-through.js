module.exports = function (module) {
    module
        .directive('noClickThrough', function () {
            return {
                restrict: 'A',
                link: function ($scope, $element) {
                    $element.on('click', ($event) => {
                        $event.stopPropagation();
                    });
                }
            };
        });
};
