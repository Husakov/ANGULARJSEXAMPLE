module.exports = function (module) {
    module
        .factory('textEditorManager', function (textAngularManager, TextEditorInjector, $q) {
            'ngInject';
            function setup() {
                _.each(editors, (editor, name) => {
                    if (components[name] && components[name].length > 0) {
                        components[name].forEach(component => {
                            if (!component.inited) {
                                component.editor = editor;
                                component.inited = true;
                                component.init && component.init();
                            }
                        });
                    }
                    if (editor.inited) {
                        return;
                    }
                    let $editorScope;
                    editor.$editor = textAngularManager.retrieveEditor(name);
                    editor.injector = new TextEditorInjector(editor, editor.manager);
                    $editorScope = editor.$editor.scope;
                    $editorScope.editor = editor;
                    $editorScope.injector = editor.injector;

                    editor.init();
                    editor.inited = true;

                    if (defers[name] && defers[name].length > 0) {
                        defers[name].forEach(defer => {
                            defer.resolve(editor);
                        });
                    }
                });

                if (actions.length > 0) {
                    actions.forEach(action => action());
                    actions = [];
                }
            }

            function fixForFocus($element) {
                $element
                    .on('mousedown click mouseup focus keyup', function (e) {
                        e.stopPropagation();
                    });
            }

            let editors = {},
                components = {},
                defers = {},
                actions = [],
                init = _.debounce(setup, 50);

            class Manager {
                registerComponent(name, component) {
                    if (!components[name]) {
                        components[name] = [];
                    }
                    components[name].push(component);
                    init();
                }

                registerEditor(name, editor) {
                    editors[name] = editor;
                    init();
                }

                getEditor(editorName, isSync = false) {
                    if (isSync) {
                        return editors[editorName];
                    }
                    let defer = $q.defer();
                    if (editors[editorName]) {
                        defer.resolve(editors[editorName]);
                    } else {
                        if (!defers[editorName]) {
                            defers[editorName] = [];
                        }
                        defers[editorName].push(defer);
                    }

                    return defer.promise
                        .then(editor => {
                            _.pull(defers[editorName], defer);
                            return editor;
                        });
                }

                destroyEditor(name) {
                    delete editors[name];
                    delete defers[name];
                    delete components[name];
                }

                fixForToolbarFocus($element) {
                    actions.push(function () {
                        fixForFocus($element.find('.dropdown-menu'));
                    });
                    init();
                }

                setSelectionHelper(helper) {
                    this.selectionHelper = helper;
                }
            }
            return new Manager();
        });
};
