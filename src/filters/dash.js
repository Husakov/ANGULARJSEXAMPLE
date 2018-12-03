module.exports = function (module) {
    module
        .filter('dash', function () {
            return function (input) {
                return input ? input : '―';
            };
        });
};
