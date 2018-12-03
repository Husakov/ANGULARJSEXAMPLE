module.exports = function (module) {
    module
        .filter('startcase', function () {
            return function (input) {
                return _.startCase(input);
            };
        });
};
