module.exports = function (mod) {
    const templates = {
        link: require('./templates/link.html'),
        savedReply: require('./templates/savedReply.html')
    };

    mod.factory('textEditorActions', function (textEditorSelectionHelper, $timeout, $q) {
        'ngInject';
        const selectionHelper = textEditorSelectionHelper;
        const actions = {};

        ['bold', 'italic']
            .forEach(action => {
                actions[action] = {
                    icon: `fa fa-${action}`,
                    action: function () {
                        return this.injector.execCommand(action);
                    },
                    isActive: function () {
                        return this.injector.queryCommandState(action);
                    }
                };
            });

        ['p', 'h1', 'h2']
            .forEach(tagName => {
                actions[tagName] = {
                    text: tagName,
                    action: function () {
                        let savedSelection = selectionHelper.saveSelection();
                        selectionHelper
                            .getValidTopNodesOfRange(this.editor.$textContent)
                            .each((i, el) => {
                                let $wrap = angular.element(`<${tagName}>`);
                                $wrap.append(el.childNodes);
                                el.replaceWith($wrap[0])
                            });
                        savedSelection.restore();
                        this.update();
                    },
                    isActive: function () {
                        let $directChildren = selectionHelper.getValidTopNodesOfRange(this.editor.$textContent);
                        return !_.some($directChildren, el => tagName !== el.tagName.toLowerCase())
                    }
                }
            });

        ['left', 'center', 'right', 'justify']
            .forEach(align => {
                let command = align !== 'justify' ? `justify${_.capitalize(align)}` : 'justifyFull';
                actions[command] = {
                    icon: `fa fa-align-${align}`,
                    action: function () {
                        selectionHelper
                            .getValidTopNodesOfRange(this.editor.$textContent)
                            .css({'text-align': align});
                        this.update();
                    },
                    isActive: function () {
                        return this.injector.queryCommandState(command);
                    }
                }
            });

        actions.link = {
            icon: 'fa fa-link',
            asyncAction: function () {
                let selection = selectionHelper.getSelection(),
                    $element = selectionHelper.getSelectionContainer(selection);

                if (this.isActive()) {
                    $element.replaceWith($element.contents());
                } else {
                    let $node = angular.element('<a href="" target=""></a>');
                    textEditorSelectionHelper.wrapSelection($node, selection, true);
                    $timeout(() => $node.click(), 100);
                }
                selectionHelper.clearSelection(selection);
            },
            isActive: function (selection) {
                let $element = selectionHelper.getSelectionContainer(selection);
                return $element && $element.is('a');
            },
            onSelect: {
                selector: 'a',
                action: function ($element, editor) {
                    const httpRegExpPrefix = /^https?:\/\//i;
                    const $scope = editor.$scope.$new();

                    $scope.linkElement = {url: $element.attr('href')};
                    $scope.remove = function () {
                        $element.replaceWith($element.contents());
                        editor.popover.hide();
                    };

                    $scope.$watch('linkElement.url', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            if (!httpRegExpPrefix.test(newVal)) {
                                newVal = `http://${newVal}`;
                            }
                            $element.attr('href', newVal);
                        }
                    });
                    editor.popover.show(templates.link, $scope, $element, true);
                    editor.popover.onHide(() => editor.emitter.emit('sync'), $scope);
                    $timeout(() => {
                        $scope.$element.find('input').focus();
                    }, 100);
                }
            }
        };

        actions.emoj = {
            display: '<emoj-dropdown on-select="select(emotion)" is-open="isOpen" is-disabled="isDisabled()"></emoj-dropdown>',
            asyncAction: function () {
                let off;
                this.focus();
                return $q((resolve, reject) => {
                    off = this.$watch('isOpen', () => {
                        if (!this.isOpen) {
                            reject();
                        }
                    });
                    this.select = (value) => {
                        resolve(value);
                    };
                })
                    .then(value => this.insert(value))
                    .finally(() => {
                        this.select = null;
                        off();
                    });
            },
            insert: function (value) {
                this.injector.insertText(value);
            }
        };

        actions.button = {
            icon: 'fa fa-square-o',
            action: function () {
                const model = _.escape(angular.toJson({type: 'button'}));
                const $node = this.injector.compile(`<te-component data-model="${model}" injected="true"></te-component>`);
                this.injector.insertNode($node, true);
                this.update();
            }
        };

        actions.savedReply = {
            icon: `fa fa-puzzle-piece`,
            asyncAction: function ($e) {
                this.focus();
                return $q((resolve, reject) => {
                    this.editor.popover.show(templates.savedReply, this.$new(), angular.element($e.currentTarget), true);
                    this.editor.popover.onHide(() => reject, this);
                    this.select = (value) => {
                        resolve(value);
                    };
                })
                    .then(value => this.insert(value))
                    .finally(() => {
                        this.select = null;
                    });
            },
            insert: function (value) {
                this.editor.popover.hide();
                return this.injector.insertBlocks(value.blocks);
            }
        };

        actions.video = {
            icon: 'fa fa-caret-square-o-right',
            action: function () {
                const model = _.escape(angular.toJson({type: 'video'}));
                const $node = this.injector.compile(`<te-component data-model="${model}" injected="true"></te-component>`);
                this.injector.insertNode($node, true);
                this.update();
            }
        };

        return {
            actions,
            getActionToolScope: function (toolName, $parentScope) {
                let tool = actions[toolName];
                if (!tool) {
                    return;
                }
                let $scope = $parentScope.$new();
                angular.extend($scope, {
                    update: function () {
                        this.editor.emitter.emit('sync');
                    },
                    focus: function () {
                        selectionHelper.moveToElement($parentScope.$ctrl.$element);
                    },
                    action: function ($e) {
                        if (this.asyncAction && !this.inAction) {
                            this.inAction = true;
                            $q.resolve()
                                .then(() => this.asyncAction($e))
                                .then(() => this.update())
                                .finally(() => this.inAction = false);
                        }
                    },
                    isActive() {
                        return false;
                    },
                    isDisabled: function () {
                        return this.editor.isDisabled();
                    }
                }, tool);
                return $scope;
            },
            bind: function ($container, editor) {
                let offArray = [];

                Object.keys(actions)
                    .map(key => actions[key])
                    .filter(tool => !!tool.onSelect)
                    .map(tool => tool.onSelect)
                    .forEach(onSelect => {
                        let action = ($e) => {
                            let $target = angular.element($e.target);
                            if (selectionHelper.isInTree($target, 'te-component')) {
                                return;
                            }
                            onSelect.action($target, editor);
                        };
                        $container.on('click', onSelect.selector, action);
                        offArray.push(() => $container.off('click', onSelect.selector, action));
                    });

                return function () {
                    offArray.forEach(off => off());
                };
            }
        };
    });
};
