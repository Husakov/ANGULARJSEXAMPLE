module.exports = function (mod) {
    require('./editor.scss');

    class Controller {
        constructor(textEditorManager, TextEditorParser, localStorageService, $scope, $attrs) {
            'ngInject';
            this.manager = textEditorManager;
            this.TextEditorParser = TextEditorParser;
            this.localStorageService = localStorageService;
            this.$scope = $scope;

            if ($attrs.placeholder) {
                this.placeholder = $attrs.placeholder;
            }

            this.saveDebounced = _.debounce(this.save.bind(this), 800);
        }

        $onInit() {
            this.options = angular.extend({
                styleToolbarDisabled: false,
                saveDisabled: false,
                parseVideoUrls: false
            }, this.options);

            this.parser = new this.TextEditorParser({parseVideoUrls: this.options.parseVideoUrls});

            this.ngModel.$render = () => {
                if (this.ngModel.$viewValue) {
                    this.content = this.parser.toHtml(this.ngModel.$viewValue);
                }
            };
            this.$scope.$watch(
                () => this.content,
                _.throttle(() => this.updateModel(), 500)
            );

            this.name = this.name || 'textEditor_' + _.uniq();
            this.styleToolbarName = this.name + '_StyleToolbar';

            let toolbars = _.compact(_.get(this, 'toolbars', '').split(','));
            if (!this.options.styleToolbarDisabled) {
                toolbars.push(this.styleToolbarName);
            }
            this.toolbarNames = toolbars.join(',');

            this.components = this.components || [];

            this.manager.registerEditor(this.name, this);

            this.refer = this;
        }

        init() {
            if (this.ngModel.$viewValue) {
                this.save();
            } else {
                this.load();
            }
        }

        updateModel() {
            if (this.inited) {
                let blocks = this.parser.toBlocks(this.content, {attachments: this.injector.getAttachmentsData()});
                this.injector.prepareBlocks(blocks);
                if (!_.isEqual(this.ngModel.$viewValue, blocks)) {
                    this.ngModel.$setViewValue(blocks);
                    this.saveDebounced();
                    this.onChange && this.onChange();
                }
            }
        }

        $onDestroy() {
            this.manager.destroyEditor(this.name);
        }

        save() {
            if (this.localStorageService.isSupported && !this.options.saveDisabled) {
                if (this.content) {
                    let blocksJson = angular.toJson(this.ngModel.$viewValue);
                    this.localStorageService.set(this.name + '_blocks', blocksJson);
                } else {
                    this.localStorageService.remove(this.name + '_blocks');
                }
                this.localStorageService.set(this.name + '_injector', this.injector.serialize());
                this.saved = true;
                this.$scope.$apply();
            }
        }

        load() {
            if (this.localStorageService.isSupported && !this.options.saveDisabled) {
                let blocksJson = this.localStorageService.get(this.name + '_blocks') || '[]';
                this.ngModel.$setViewValue(angular.fromJson(blocksJson));
                this.ngModel.$render();
                this.injector.deserialize(this.localStorageService.get(this.name + '_injector'));
                this.saved = true;
            } else {
                this.content = '';
            }
        }

        isReady() {
            return this.injector && this.injector.isReady();
        }

        isEmpty() {
            return this.isReady() && !(this.content && this.content.length > 0 || this.injector.attachments.length > 0);
        }

        clear() {
            this.content = '';
            this.injector.clear();
        }

        setPopover(popover) {
            this.popover = popover;
        }

        saveReply(message) {
            this.$editor
                .toolbarScopes
                .forEach(scope => scope.$broadcast('textEditor.saveReply', message));
        }

        getTextContainer() {
            return this.$editor && this.$editor.scope.displayElements.text;
        }

        newAttachment(upload, isImage) {
            let html = '',
                options;
            if (isImage) {
                html = upload.$imageElement.prop('outerHTML');
            } else {
                options = {
                    attachments: this.injector.getAttachmentsData([upload])
                };
            }

            let blocks = this.parser.toBlocks(html, options);
            blocks.uploads = _.map([upload], 'id');

            this.onAttachment && this.onAttachment({blocks});
        }
    }

    mod.component('textEditor', {
        templateUrl: require('./index.html'),
        controller: Controller,
        bindings: {
            name: '@',
            refer: '=?',
            toolbars: '<?',
            options: '<?',
            components: '<?',
            onChange: '&?',
            onAttachment: '&?'
        },
        require: {
            ngModel: '^ngModel'
        }
    });
};
