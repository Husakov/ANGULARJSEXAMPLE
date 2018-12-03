module.exports = function (mod) {
    mod
        .constant('CONFIG', require('./config.js'))
        .constant('IS_RETINA', (function () {
            let media1 = 'only screen and (min-resolution: 124dpi), ' +
                    'only screen and (min-resolution: 1.3dppx), ' +
                    'only screen and (min-resolution: 48.8dpcm)',
                media2 = 'only screen and (-webkit-min-device-pixel-ratio: 1.3), ' +
                    'only screen and (-o-min-device-pixel-ratio: 2.6/2), ' +
                    'only screen and (min--moz-device-pixel-ratio: 1.3), ' +
                    'only screen and (min-device-pixel-ratio: 1.3)';
            return (
                (window.matchMedia && (window.matchMedia(media1).matches || window.matchMedia(media2).matches ))
                || (window.devicePixelRatio && window.devicePixelRatio > 1.3)
            );
        })())
        .constant('FILE_TYPES', (function () {
            let types = {
                images: ['bmp', 'gif', 'jpeg', 'jpg', 'png'],
                files: [
                    'zip', 'csv', 'otf', 'ai',
                    'bmp', 'gif', 'jpeg', 'jpg', 'png',
                    'psd', 'svg', 'tif', 'tiff',
                    'avi', 'm4v', 'mov', 'mp3', 'mp4', 'mpg', 'mpeg', 'wmv',
                    'doc', 'docx', 'pdf', 'rtf', 'txt'
                ]
            };

            _.each(types, function (exts, key) {
                types[key] = exts.map(ext => '.' + ext).join(',');
                types[key + 'Reg'] = new RegExp(`(${exts.join('|')})$`);
                types.all += ',' + types[key];
            });

            types.imagesMaxSize = 1024 * 1024;

            return types;
        })());
};
