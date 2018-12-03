module.exports = function (module) {
    function isEmpty(obj) {
        let bar;
        for (bar in obj) {
            if (obj.hasOwnProperty(bar)) {
                return false;
            }
        }
        return true;
    }

    module
        .filter('isNotEmpty', function () {
            return function (obj) {
                return !isEmpty(obj);
            };
        });
};
