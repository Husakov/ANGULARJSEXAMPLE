module.exports = function (mod) {
    const template = '<text-editor-mentions-menu select="$ctrl.select(result)"></text-editor-mentions-menu>';

    class Controller {
        constructor(textEditorManager, textEditorSelectionHelper, dropdownHelper, $scope) {
            'ngInject';
            this.manager = textEditorManager;
            this.selectionHelper = textEditorSelectionHelper;

            this.selectionHelper.on('change', this.checkSelection.bind(this), $scope);
            this.selectionHelper.on('keydown', this.keydown.bind(this), $scope);
            this.menu = new dropdownHelper.DropdownComponent($scope.$new(), template);
        }

        $onInit() {
            this.triggerChar = '@';
            this.manager.registerComponent(this.editorName, this)
        }

        checkSelection(selection) {
            if (this.selectionHelper.isSelectionInEditor(this.editorName, selection)) {
                let searchText = this.selectionHelper.getMentionSearchText(selection, this.triggerChar);

                if (!_.isNull(searchText)) {
                    this.search(searchText);
                } else {
                    this.menu.hide();
                }
            } else {
                this.menu.hide();
            }
        }

        search(search) {
            this.lastSearch = search;
            this.menu.$scope.$broadcast('mention.search', search.text);
            this.menu.show(this.selectionHelper.getSelectedRect(), ['left', 'bottom']);
        }

        select(result) {
            this.lastSearch.select();
            this.editor.injector.insertMention(result);
            this.menu.hide();
        }

        keydown($e) {
            if (!this.menu.hidden) {
                if ([38, 40].includes($e.keyCode)) {
                    this.menu.$scope.$broadcast('mention.move', $e.keyCode === 40);

                    $e.stopPropagation();
                    $e.preventDefault();
                }
                if ($e.keyCode === 13) {
                    this.menu.$scope.$broadcast('mention.select');

                    $e.stopPropagation();
                    $e.preventDefault();
                }
            }
        }
    }

    mod.component('textEditorMentions', {
        controller: Controller,
        bindings: {
            editorName: '@'
        }
    });

    require('./mentionsMenu')(mod);
};
