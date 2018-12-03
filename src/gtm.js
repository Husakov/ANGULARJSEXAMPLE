module.exports = function (dependencies) {
    dependencies.push(...[
        require('angulartics'),
        require('angulartics-google-tag-manager')
    ]);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });

    const $script = angular.element('<script>');
    $script.attr({
        async: true,
        src: 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID
    });
    $script.appendTo('head');
};
