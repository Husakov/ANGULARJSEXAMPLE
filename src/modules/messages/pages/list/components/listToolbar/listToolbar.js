module.exports = function (module) {
    require('./listToolbar.scss');

    class Controller {
        constructor(messagesSectionsHelper, messagesActions, dialogs, $state, $scope) {
            'ngInject';
            this.sectionsHelper = messagesSectionsHelper;
            this.messagesActions = messagesActions;
            this.dialogs = dialogs;
            this.$state = $state;

            this.setFolders();
            this.sectionsHelper.on('update', () => this.setFolders(), $scope);
        }

        onSearch(name, adminId) {
            let params = {};
            if (name) {
                params.title = name;
            }
            if (adminId) {
                params.from_id = adminId;
            }
            this.listHelper.search(params);
        }

        setFolders() {
            this.sectionsHelper
                .getFolders()
                .then(folders => this.folders = folders);
        }

        summary() {
            this.dialogs
                .messagesListSummary();
        }

        deleteChecked() {
            let items = this.listHelper.checkedItems.slice();

            this.messagesActions
                .delete(items, () => {
                    this.listHelper.removeFromList(items);
                });
        }

        moveTo(folder) {
            let items = this.listHelper.checkedItems.slice();

            this.messagesActions
                .moveTo(items, folder, () => {
                    if (this.$state.params.folders && this.$state.params.state !== folder.state) {
                        this.listHelper.removeFromList(items);
                    }
                });
        }

        duplicateChecked() {
            let items = this.listHelper.checkedItems.slice();

            this.messagesActions
                .duplicate(items, () => {
                    this.listHelper.clearSelection();
                })
                .then(() => {
                    this.listHelper.resetItems();
                    this.listHelper.loadMore();
                });
        }
    }

    module
        .component('messagesListToolbar', {
            templateUrl: require('./index.html'),
            controller: Controller,
            bindings: {
                listHelper: '='
            }
        });
};
