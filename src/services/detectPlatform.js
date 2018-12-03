module.exports = function (module) {
    module
        .factory('detectPlatform', function () {
            'ngInject';

            return {
                init: function init() {
                    this.isMac = navigator.platform.indexOf('Mac') > -1;
                    this.isWin = navigator.platform.indexOf('Win') > -1;
                    this.isLinux = navigator.platform.indexOf('Linux') > -1;

                    this.platformClass = '';
                    if (this.isMac) {
                        this.platformClass += ' mac-platform'
                    }
                    if (this.isWin) {
                        this.platformClass += ' win-platform'
                    }
                    if (this.isLinux) {
                        this.platformClass += ' linux-platform'
                    }
                }
            };
        });
};
