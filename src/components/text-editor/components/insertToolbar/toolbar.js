module.exports = function (mod) {
    require('./toolbar.scss');

    class Controller {
        constructor(textEditorManager, textAngularManager, $element) {
            'ngInject';
            this.textAngularManager = textAngularManager;

            this.tools = [
                [
                    'te-emoj',
                    'te-file',
                    'te-gif',
                    'te-video',
                    'te-button',
                    'te-saved-replies'
                ]
            ];

            if (this.exclude) {
                this.tools.forEach(
                    tools => this.exclude
                        .forEach(
                            tool => _.pull(tools, tool)
                        )
                );
            }

            textEditorManager.fixForToolbarFocus($element);
        }

        $onInit() {
            this.toolbar = this.textAngularManager.retrieveToolbar(this.name);
        }
    }

    mod.component('textEditorInsertToolbar', {
        template: '<text-angular-toolbar name="{{::$ctrl.name}}" ta-toolbar="::$ctrl.tools"></text-angular-toolbar>',
        bindings: {
            name: '@',
            exclude: '=?'
        },
        controller: Controller
    });
};
