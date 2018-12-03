module.exports = function (module) {
    module
        .filter('limitWithDots', function () {
            return function (value, max, wordwise = true, tail) {
                if (!value) return '';

                max = parseInt(max, 10);
                if (!max) return value;
                if (value.length <= max) return value;

                value = value.substr(0, max);
                if (wordwise) {
                    let lastspace = value.lastIndexOf(' ');
                    if (lastspace !== -1) {
                        if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
                            lastspace = lastspace - 1;
                        }
                        value = value.substr(0, lastspace);
                    }
                }

                return value + (tail || ' …');
            };
        });
};
