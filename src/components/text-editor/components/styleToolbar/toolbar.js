module.exports = function (mod) {

    require('./toolbar.scss');
    const template = '<div class="text-editor-style-toolbar">' +
        '<text-angular-toolbar name="{{::$ctrl.name}}" ta-toolbar="::$ctrl.tools" ' +
        'ta-toolbar-group-class="btn-toolbar-group" ta-toolbar-button-class="btn btn-toolbar"></text-angular-toolbar>' +
        '</div>';

    class Controller {
        constructor(textAngularManager, textEditorSelectionHelper, dropdownHelper, $scope) {
            'ngInject';
            this.textAngularManager = textAngularManager;
            this.selectionHelper = textEditorSelectionHelper;

            this.tools = [
                ['bold'],
                ['italics'],
                ['p', 'h1', 'h2'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                ['te-link']
            ];

            this.hidden = true;

            this.selectionHelper.on('change', this.checkSelection.bind(this), $scope);

            this.component = new dropdownHelper.DropdownComponent($scope, template);
        }

        $onInit() {
            this.toolbar = this.textAngularManager.retrieveToolbar(this.name);
        }

        checkSelection(selection) {
            if (selection.text.length === 0) {
                this.component.hide();
                return;
            }

            if (this.selectionHelper.isSelectionInEditor(this.editorName, selection)) {
                this.component.show(this.selectionHelper.getSelectedRect(), ['center', 'top']);
            } else {
                this.component.hide();
            }
        }
    }

    mod.component('textEditorStyleToolbar', {
        controller: Controller,
        bindings: {
            name: '@',
            editorName: '@'
        }
    });
};
