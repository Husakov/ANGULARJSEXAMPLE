module.exports = function (mod) {

    const tools = [
        ['emoj'],
        ['video'],
        ['button']
    ];

    const template = '<text-editor-toolbar tools="$ctrl.tools" editor="$ctrl.editor"></text-editor-toolbar>';

    class Controller {
        constructor($scope) {
            'ngInject';
            let exclude = $scope.$parent.$eval(this.excludeAttr) || [];
            this.tools = tools
                .map(cat => cat.filter(tool => !exclude.includes(tool)))
                .filter(cat => cat.length > 0);
        }
    }

    mod.component('textEditorInsertToolbar', {
        controller: Controller,
        template: template,
        bindings: {
            editor: '=',
            excludeAttr: '@?exclude'
        }
    });
};
