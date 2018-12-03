module.exports = function (module) {
    module
        .filter('emojis', function (emojis) {
            'ngInject';
            return function (input, size) {
                return emojis.toImage(input, size);
            };
        });
};
