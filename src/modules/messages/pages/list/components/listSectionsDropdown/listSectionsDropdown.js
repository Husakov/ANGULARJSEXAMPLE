module.exports = function (module) {

    const userRoles = [
        {
            title: 'Visitors',
            state: 'visitor'
        },
        {
            title: 'Leads',
            state: 'lead'
        },
        {
            title: 'Users',
            state: 'user'
        }
    ];

    class Controller {
        constructor(messagesSectionsHelper, pubSub, $scope, $state, dialogs, $timeout) {
            'ngInject';
            this.menuHelper = messagesSectionsHelper;
            this.$scope = $scope;
            this.$state = $state;
            this.dialogs = dialogs;
            this.$timeout = $timeout;

            this.menu = [];

            this.initState($state.params);
            pubSub.onStateChanged((event, toState, toParams) => {
                this.initState(toParams);
            }, $scope);

            this.menuHelper.init();
            this.menuHelper.on('update', () => this.setMenu(), $scope);

        }

        initState(params) {
            this.isMenuOpen = false;
            this.currentRole = _.find(userRoles, {state: params.role});
            if (params.state !== this.currentState) {
                this.currentState = params.state;
            }
            if (params.type !== this.currentType) {
                this.currentType = params.type;
                this.setMenu();
            }
        }

        setMenu() {
            this.menuHelper
                .getMenu(this.currentType)
                .then(menu => {
                    this.menu = menu && menu.items || [];
                });
        }

        getMenuItems() {
            return this.menu;
        }

        getRoles() {
            if (this.currentType === 'manual') {
                return userRoles.filter(r => r.state !== 'visitor');
            } else {
                return userRoles;
            }
        }

        newFolder() {
            let item = {
                    icon: 'fa-folder',
                    isEdit: true,
                    isFolder: true,
                    count: 0
                },
                arr = this.menu;

            let off = this.$scope.$watch(() => item.isEdit, () => {
                if (!item.isEdit) {
                    off();
                    _.pull(arr, item);
                }
            });

            arr.push(item);
        }

        editFolder(item, value) {
            item.title = value;
            if (!item.id) {
                item = angular.copy(item);
                delete item.isEdit;
                this.$timeout(() => {
                    this.menu.push(item);
                }, 0);
            }
            this.menuHelper
                .saveFolder(item)
                .finally(() => this.setMenu());
        }

        deleteFolder(item) {
            let id = item.id;
            this.dialogs
                .confirm({
                    title: 'Are you sure you want to delete this folder?',
                    body: 'Only the folder will be deleted.<br>Any messages within the folder will be moved outside of it.',
                    closeText: 'Delete Folder'
                })
                .then(() => {
                    _.pull(this.menu, item);
                    return this.menuHelper.deleteFolder(item);
                })
                .then(() => {
                    if (id === this.$state.params.state) {
                        this.$state.go('.', {state: null});
                    }
                })
                .finally(() => this.setMenu());
        }

        stopEvent($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    module
        .component('messagesListSectionsDropdown', {
            templateUrl: require('./index.html'),
            controller: Controller,
            bindings: {
                listHelper: '='
            }
        });
};
