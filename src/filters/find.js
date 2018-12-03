module.exports = function (module) {
    module
        .filter('find', function () {
            return function (value, array, prop = 'id') {
                return _.find(array, i => i[prop] === value);
            };
        });
};
