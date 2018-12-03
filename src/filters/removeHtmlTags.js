module.exports = function (module) {
    module
        .filter('removeHtmlTags', function () {
            return function (text) {
                if (text) {
                    return String(text)
                        .replace(/<[^>]+>/gm, '')
                        .replace(/&nbsp;/gm, ' ');
                }

                return '';
            };
        });
};
