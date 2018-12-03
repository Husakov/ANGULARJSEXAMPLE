module.exports = function (mod) {

    require('./attachments.scss');

    class Controller {
        constructor(textEditorManager, $scope, $element, $timeout) {
            'ngInject';
            this.manager = textEditorManager;
            this.$scope = $scope;
            this.$element = $element;
            this.$timeout = $timeout;
        }

        $onInit() {
            this.manager.registerComponent(this.editorName, this);
            this.$imagesContainer = this.$element.find('.images-container');
        }

        init() {
            this.isAttachmentsSeparated = !!this.editor.onAttachment;
            if (this.isAttachmentsSeparated) {
                this.$scope.$watchCollection(() => this.editor && this.editor.injector.uploads, (uploads) => {
                    if (uploads && uploads.length) {
                        uploads
                            .filter(u => u.isImage)
                            .forEach(u => {
                                let include = this.$imagesContainer.has(u.$element).length !== 0;
                                if (!include && !u.uploaded) {
                                    this.addImage(u);
                                }
                            })
                    }
                });
            }
        }

        addImage(img) {
            this.$imagesContainer.append(img.$element);
            img.$promise
                .then(() => this.$timeout(500))
                .then(() => img.$element.remove());
        }
    }

    mod.component('textEditorAttachments', {
        templateUrl: require('./index.html'),
        controller: Controller,
        bindings: {
            editorName: '@'
        }
    });
};
