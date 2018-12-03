module.exports = function (mod) {
    let templates = {
        teSavedReplies: require('./te-saved-replies.html'),
        teLink: require('./te-link.html'),
        teButton: require('./te-button.html'),
        teVideo: require('./te-video.html')
    };

    mod.run(function (taRegisterTool, taSelection, textEditorSelectionHelper, mnhVideoUtils, textEditorElementsHelper,
                      $templateCache, $document, $timeout) {
        'ngInject';

        function register(name, toolDefinition) {
            let isSync = true,
                _restoreSelection,
                _handler,
                _def;
            if (_.has(toolDefinition, 'isSync')) {
                isSync = toolDefinition.isSync;
                delete toolDefinition.isSync;
            }
            taRegisterTool(name, Object.assign({}, {
                action: function (def, restoreSelection) {
                    _def = def;
                    _restoreSelection = restoreSelection;
                    _handler = e => {
                        if (!(this.$element && this.$element[0].contains(e.target))) {
                            this.done();
                        }
                    };
                    this.$editor().editor.$editor.editorFunctions.focus();
                    $timeout(() => $document.on('click', _handler));
                    return isSync;
                },
                activeState: function () {
                    return false;
                },
                done: function () {
                    $document.off('click', _handler);
                    _restoreSelection();
                    _def.resolve();
                }
            }, toolDefinition));
        }

        _.each(templates, (url, key) => {
            templates[key] = $templateCache.get(url);
        });

        let actions = {
            onASelected: function (type = 'link') {
                return function (event, $element, $editorScope) {
                    let isButton = type === 'button',
                        template = isButton ? templates.teButton : templates.teLink,
                        $scope = $editorScope.$new();

                    const httpRegExpPrefix = /^https?:\/\//i;

                    function update() {
                        $editorScope.updateTaBindtaTextElement();
                    }

                    event.preventDefault();

                    $scope.linkElement = {url: $element.attr('href')};
                    $scope.$watch('linkElement.url', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            if (!httpRegExpPrefix.test(newVal)) {
                                newVal = `http://${newVal}`;
                            }

                            $element.attr('href', newVal);
                        }
                    });

                    if (isButton) {
                        let untouched = $element.hasClass('untouched');
                        if (!untouched) {
                            $scope.linkElement.title = $element.text();
                        }
                        $scope.$watch('linkElement.title', function (newVal, oldVal) {
                            if (newVal !== oldVal) {
                                untouched = newVal.length === 0;
                                if (untouched) {
                                    $element.text(textEditorElementsHelper.BUTTON_DEFAULT_TEXT)
                                        .addClass('untouched')
                                        .css({opacity: 0.7});
                                } else {
                                    $element.text(newVal)
                                        .removeClass('untouched')
                                        .css({opacity: 1});
                                }
                                update();
                            }
                        });

                        $scope.align = $element.parent().css('text-align');
                        $scope.setAlign = function (value) {
                            switch (value) {
                                case 'left':
                                case 'right':
                                case 'center':
                                    $scope.align = value;
                                    break;
                                default:
                                    break;
                            }
                        };

                        $scope.setButtonDetails = function (type) {
                            $scope.buttonDetailsType = type;
                            $editorScope.editor.popover.updatePosition($element);
                        };

                        $scope.$watch('align', function (newVal, oldVal) {
                            if (newVal !== oldVal) {
                                $element.parent().css('text-align', newVal);
                                $editorScope.editor.popover.updatePosition($element);
                                update();
                            }
                        });
                    } else {
                        $scope.remove = function () {
                            $element.replaceWith($element.contents());
                            $editorScope.editor.popover.hide();
                        };
                    }

                    $editorScope.editor.popover.show(template, $scope, $element);
                    $editorScope.editor.popover.onHide(() => update(), $scope);

                    if (type === 'link') {
                        $timeout(() => {
                            $scope.$element.find('input').focus();
                        }, 100);
                    }
                }
            },
            videoSelected: function (event, $element, $editorScope) {
                let template = templates.teVideo,
                    $scope = $editorScope.$new();

                event.preventDefault();

                function update() {
                    $editorScope.updateTaBindtaTextElement();
                }

                function initData() {
                    let {data} = textEditorElementsHelper.getData($element),
                        {provider, id} = data || {},
                        videoInfo = mnhVideoUtils.getInfoByProvider(provider, id);
                    $scope.src = videoInfo ? videoInfo.getVideoSrc() : '';
                }

                initData();
                $scope.$watch('src', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        let {provider, id} = mnhVideoUtils.getInfoBySrc(newVal) || {};
                        textEditorElementsHelper.setData($element, {
                            data: {provider, id}
                        });
                        update();
                    }
                });

                $scope.remove = function () {
                    $element.parents('.mnh-m-video-wrapper').remove();
                    $editorScope.editor.popover.hide();
                };

                $editorScope.editor.popover.show(template, $scope, $element);
                $editorScope.editor.popover.onHide(() => update(), $scope);
            }
        };

        function postActionElementClick($element) {
            $timeout(() => {
                let $actionElement = $element.find('.action-element');
                $actionElement.focus();
                $actionElement.click();
            }, 100);
        }

        register('te-emoj', {
            display: '<emoj-dropdown on-select="done();$editor().injector.insertEmotion(emotion)" class="dropup"></emoj-dropdown>',
            isSync: false
        });
        register('te-gif', {
            display: '<giphy-dropdown on-select="done();$editor().injector.insertGif(gif)" class="dropup"></giphy-dropdown>',
            isSync: false
        });
        register('te-file', {
            display: '<upload on-select="$editor().injector.insertFile(file)" accept="::$editor().injector.fileTypes">' +
            '<i class="fa fa-paperclip" aria-hidden="true"></i>' +
            '</upload>'
        });
        register('te-saved-replies', {
            display: templates.teSavedReplies,
            isSync: false,
            isOpen: false,
            register: function (savedReplyComponent) {
                let action = (e, message) => {
                    if (!this.isOpen) {
                        this.action();
                        this.toggle();
                    }
                    savedReplyComponent.create(message);
                };
                this.$on('textEditor.saveReply', action);
            },
            select: function (reply) {
                this.done();
                this.toggle();
                this.$editor().injector.insertReply(reply);
            },
            toggle: function () {
                let handler = () => this.toggle();
                this.toggle = function () {
                    this.isOpen = !this.isOpen;
                    if (this.isOpen) {
                        $timeout(() => $document.on('click', handler));
                    } else {
                        $document.off('click', handler);
                    }
                };
                this.toggle();
            }
        });
        register('te-link', {
            iconclass: 'fa fa-link',
            action: function () {
                let element = taSelection.getSelectionElement(),
                    $element = angular.element(element);
                if (element.tagName && element.tagName.toLowerCase() === 'a' && !$element.hasClass('btn-message')) {
                    $element.replaceWith($element.contents());
                } else {
                    let $node = angular.element('<a href="" target=""></a>');
                    textEditorSelectionHelper.wrapSelection($node[0]);
                    $timeout(() => {
                        $node.click();
                    }, 100);
                }
            },
            activeState: function (commonElement) {
                return commonElement && commonElement[0].tagName.toLowerCase() === 'a';
            },
            onElementSelect: {
                element: 'a',
                filter: function ($element) {
                    return !$element.hasClass('mnh-m-btn-message');
                },
                action: actions.onASelected('link')
            }
        });
        register('te-button', {
            iconclass: 'fa fa-square-o',
            class: 'btn btn-default te-button',
            action: function () {
                let $element = this.$editor().injector.insertButton();
                postActionElementClick($element);
            },
            onElementSelect: {
                element: 'a',
                filter: function ($element) {
                    return $element.hasClass('mnh-m-btn-message');
                },
                action: actions.onASelected('button')
            }
        });
        register('te-video', {
            iconclass: 'fa fa-caret-square-o-right',
            action: function () {
                let $element = this.$editor().injector.insertVideo();
                postActionElementClick($element);
            },
            onElementSelect: {
                element: 'div',
                filter: function ($element) {
                    return $element.hasClass('video-thumb');
                },
                action: actions.videoSelected
            }
        });
    });

    angular.module('textAngularSetup')
        .value('taSelectableElements', ['a', 'img', 'div']);
};
