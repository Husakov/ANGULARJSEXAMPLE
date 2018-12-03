module.exports = function (module) {
    module
        .factory('TextEditorInjector', function (textEditorElementsHelper, textEditorAttachmentsTypes, FILE_TYPES, $q) {
            'ngInject';

            const elementHelper = textEditorElementsHelper;

            const BUTTON_TEMPLATE = elementHelper.BUTTON_TEMPLATE;
            const VIDEO_TEMPLATE = elementHelper.VIDEO_TEMPLATE;

            const {
                Attachment,
                ImageAttachment
            } = textEditorAttachmentsTypes;

            class Injector {
                constructor(editor, manager) {
                    this.manager = manager;
                    this.editor = editor;
                    this.$editor = editor.$editor;

                    this.isAttachmentsSeparated = !!editor.onAttachment;
                    this.isMentionsOn = editor.components.includes('mentions');

                    this.imageTypes = FILE_TYPES.all;

                    this.clear();
                }

                clear() {
                    this.attachments = [];
                    this.uploads = [];
                    this.uploadsInProgress = [];
                }

                insertEmotion(emotion) {
                    this.insert(emotion);
                }

                insertGif(gif) {
                    let gifImg = gif.images.original,
                        img = new ImageAttachment(gifImg.url);
                    img.setSizes(gifImg.width, gifImg.height);

                    if (!this.isAttachmentsSeparated) {
                        this.insertNode(img.$element);
                    } else {
                        this.editor.newAttachment(img, true);
                    }
                }

                insertFile(file) {
                    let upload,
                        isImage = ImageAttachment.isValidImage(file);

                    if (isImage) {
                        upload = new ImageAttachment();
                        upload.readFile(file);
                        if (!this.isAttachmentsSeparated) {
                            this.insertNode(upload.$element);
                        }
                    } else {
                        upload = new Attachment();
                        this.attachments.push(upload);
                        this.editor.updateModel();
                    }
                    this.uploads.push(upload);
                    this.uploadsInProgress.push(upload);
                    this.uploadFileFinish(upload.upload(file), upload);
                }

                insertMention(item) {
                    this.insert(elementHelper.getMentionTemplate(item), true);
                }

                insertButton() {
                    let $node = angular.element(BUTTON_TEMPLATE);
                    this.insertNode($node);
                    return $node;
                }

                insertVideo() {
                    let $node = angular.element(VIDEO_TEMPLATE);
                    this.insertNode($node);
                    return $node;
                }

                insertReply(reply) {
                    this.editor.content = reply.body;
                }

                cancelAndRemoveFile(file) {
                    let promise;

                    if (file.uploaded) {
                        promise = $q.defer().resolve();
                    } else {
                        promise = file.cancel();
                    }

                    promise.finally(() => {
                        _.pull(this.uploadsInProgress, file);
                        _.pull(this.attachments, file);
                        _.pull(this.uploads, file);
                        this.editor.updateModel();
                    });
                }

                reloadFile(upload) {
                    this.uploadFileFinish(upload.reload(), upload);
                }

                uploadFileFinish(uploadPromise, upload) {
                    uploadPromise
                        .then(() => {
                                _.pull(this.uploadsInProgress, upload);
                                if (this.isAttachmentsSeparated) {
                                    _.pull(this.attachments, upload);
                                    _.pull(this.uploads, upload);
                                    this.editor.newAttachment(upload, upload.isImage);
                                }
                            }
                        )
                        .finally(() => {
                            this.updateModel();
                        });
                }

                insert(content, isHtml = false) {
                    this.updateModel(() => {
                        let action = isHtml ? 'insertHtml' : 'insertText';
                        this.$editor.scope.wrapSelection(action, content, true);
                    });
                }

                insertNode(node, isTop = true) {
                    this.updateModel(() => {
                        let $node = angular.element(node);
                        this.editor.getTextContainer().focus();
                        this.manager.selectionHelper.insertNode($node[0], isTop);
                    });
                }

                isReady() {
                    return this.uploadsInProgress.length === 0;
                }

                serialize() {
                    return angular.toJson({
                        attachments: this.attachments.map(file => file.toJson()),
                        uploads: this.uploads.map(file => file.toJson())
                    });
                }

                deserialize(str) {
                    let obj = angular.fromJson(str),
                        attachments = _.get(obj, 'attachments', []),
                        uploads = _.get(obj, 'uploads', []);
                    this.attachments = [];
                    this.uploads = [];
                    this.uploadsInProgress = [];

                    if (attachments) {
                        attachments.forEach(file => this.attachments.push(Attachment.fromJson(file)));
                    }

                    if (uploads) {
                        uploads.forEach(file => this.uploads.push(Attachment.fromJson(file)));
                    }
                }

                prepareBlocks(blocks) {
                    blocks.uploads = this.getUploadsIds(blocks);
                    if (this.isMentionsOn) {
                        blocks.mentions = this.getMentionsIds(blocks);
                    }
                }

                getUploadsIds(blocks) {
                    let uploads = [];
                    blocks.forEach(b => {
                        if (b.type === 'image') {
                            _.some(this.uploads, u => {
                                if (b.url === u.imageSrc) {
                                    uploads.push(u);
                                    return true;
                                }
                            });
                        } else if (b.type === 'attachmentList') {
                            b.attachments.forEach(a => {
                                _.some(this.uploads, u => {
                                    if (a.id === u.id) {
                                        uploads.push(u);
                                        return true;
                                    }
                                });
                            })
                        }
                    });
                    return uploads.map(u => u.id);
                }

                getMentionsIds(blocks) {
                    let mentions = [];
                    blocks.forEach(b => {
                        if (b.text) {
                            let match;
                            while ((match = elementHelper.MENTION_ID_REGEXP.exec(b.text)) !== null) {
                                mentions.push(match[1]);
                            }
                        }
                    });
                    return mentions;
                }

                updateModel(action = angular.noop) {
                    let savedSelection = this.manager.selectionHelper.saveSelection();
                    action();
                    // 'blur' is here, because of debounce in text-angular
                    this.editor.getTextContainer().trigger('blur');
                    savedSelection.restoreAndMoveToEnd();
                }

                getAttachmentsData(attachments = this.attachments) {
                    return attachments.map(a => a.getData());
                }
            }

            return Injector;
        });
};
