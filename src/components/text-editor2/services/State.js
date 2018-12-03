module.exports = function (mod) {

    mod.factory('TextEditorState', function (localStorageService, $timeout) {
        'ngInject';

        class Storage {
            constructor() {
                this.enabled = localStorageService.isSupported;
            }

            static set(id, value) {
                if (localStorageService.isSupported) {
                    localStorageService.set(id, value);
                }
            }

            static get(id) {
                if (localStorageService.isSupported) {
                    return localStorageService.get(id);
                }
                return null;
            }
        }

        class State {
            constructor(editor, id) {
                this.editor = editor;
                this.id = id;
                this.saveDelay = 800;

                this.enabled = !!this.id;
                this.key = 'te-' + (_.isString(this.id) ? this.id : _.uniqueId());
                this.saved = false;

            }

            init() {
                if (this.enabled) {
                    this.load();
                    this.subscribe();
                }
            }

            subscribe() {
                let handler = () => {
                    this.saved = false;
                    if (this.saveTimeout) {
                        $timeout.cancel(this.saveTimeout);
                    }
                    this.saveTimeout = $timeout(() => {
                        this.save();
                        this.saveTimeout = null;
                    }, this.saveDelay);
                };
                this.editor.emitter.on('change', handler, this.editor.$scope);
                this.editor.emitter.on('sync', handler, this.editor.$scope);
            }

            save() {
                if (this.enabled) {
                    let blocks = angular.toJson(this.editor.ngModel.$viewValue);
                    Storage.set(this.key, blocks);
                    this.saved = true;
                }
            }

            load() {
                if (this.enabled) {
                    let blocksData = Storage.get(this.key);
                    if (blocksData) {
                        this.editor.ngModel.$setViewValue(angular.fromJson(blocksData));
                        this.editor.ngModel.$render();
                    }
                }
            }
        }

        return State;
    });
};
