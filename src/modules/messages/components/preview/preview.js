module.exports = function (module) {
    require('./preview.scss');

    class Controller {
        constructor() {
            
        }
    }

    module
        .component('messagePreview', {
            templateUrl: require('./index.html'),
            bindings: {
                mediator: '='
            },
            controller: Controller
        });
};
