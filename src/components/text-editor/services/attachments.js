module.exports = function (module) {
    module
        .factory('textEditorAttachmentsTypes', function (UploadResource, textEditorElementsHelper, FILE_TYPES, $q) {
            'ngInject';

            const NOT_EDITABLE_ATTR = textEditorElementsHelper.NOT_EDITABLE_ATTR;

            class Attachment {
                constructor() {
                    this._id = _.uniqueId('atta_');
                    this._defer = $q.defer();
                    this.$promise = this._defer.promise;
                }

                setUrl(url) {
                    this.url = url;
                    this._defer.resolve();
                }

                upload(file) {
                    this.error = null;
                    this.progress = 0;
                    this.uploaded = false;
                    this.contentType = file.type;
                    this.name = file.name;
                    this.size = file.size;
                    this.file = file;
                    return UploadResource.save(file)
                        .$promise
                        .then(
                            result => this.setResponse(result),
                            err => {
                                this.setError(err);
                                return $q.reject(err);
                            },
                            _.throttle(progress => this.setProgress(progress), 500)
                        );
                }

                cancel() {
                    return UploadResource
                        .cancel(this.file)
                        .then(
                            () => this.canceled = true
                        );
                }

                reload() {
                    return this.upload(this.file);
                }

                setError(err) {
                    delete this.progress;
                    this.uploaded = false;
                    this.error = err || 'Failed';
                }

                setResponse(response) {
                    delete this.progress;
                    this.uploaded = true;
                    this.id = response.id;
                    this.size = response.file_size;
                    this.name = response.file_name;
                    this.setUrl(response.url);
                }

                setProgress(value) {
                    this.progress = value;
                }

                _getObjectToJson(obj = this) {
                    return _.pick(obj, '_id', 'id', 'size', 'name', 'url', 'uploaded', 'error');
                }

                _setFromJsonObj(obj) {
                    Object.assign(this, this._getObjectToJson(obj));
                }

                toJson() {
                    return angular.toJson(this._getObjectToJson());
                }

                getData(obj = this) {
                    return _.pick(obj, 'id', 'name', 'size', 'contentType', 'url');
                }

                static fromJson(str) {
                    let obj = angular.fromJson(str),
                        file = obj.isImage ? new ImageAttachment() : new Attachment();

                    file._setFromJsonObj(obj);

                    return file;
                }
            }

            class ImageAttachment extends Attachment {
                constructor(url) {
                    super();
                    this.isImage = true;
                    this.$element = angular.element(textEditorElementsHelper.getImageTemplate());
                    this.$imageElement = this.$element.find('img');

                    if (url) {
                        this.setUrl(url);
                    } else {
                        this.$imageElement.wrap(`<span class="in-progress" ${NOT_EDITABLE_ATTR}></span>`);
                        this.$wrapper = this.$element.find('.in-progress');
                        this.$wrapper.prepend(`<span class="overlay"></span>`);
                    }
                }

                setSizes(w, h) {
                    this.sizes = {
                        width: parseInt(w, 10),
                        height: parseInt(h, 10)
                    };
                    this.$imageElement.attr(this.sizes);
                }

                setContent(content) {
                    this.$imageElement.attr('src', content);
                    this.imageSrc = content;
                    this.content = content;

                    let img = new Image();
                    img.onload = () => {
                        this.setSizes(img.width, img.height);
                    };
                    img.src = content;
                }

                readFile(file) {
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        this.setContent(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }

                setUrl(url) {
                    this.setContent(url);
                    super.setUrl(url);
                }

                upload(file) {
                    return super.upload(file)
                        .then(() => this.replaceWrapper())
                        .then(() => this);
                }

                setProgress(value) {
                    super.setProgress(value);
                    this.$wrapper
                        .children('.overlay')
                        .css('left', value + '%');
                }

                replaceWrapper() {
                    this.$wrapper
                        .replaceWith(this.$imageElement);
                    this.$wrapper = null;
                }

                _getObjectToJson(obj = this) {
                    let result = super._getObjectToJson(obj);
                    Object.assign(result, {isImage: true});
                    return result;
                }

                _setFromJsonObj(obj) {
                    super._setFromJsonObj(obj);
                    this.setUrl(obj.url);
                }

                static isValidImage(file) {
                    return file.size < FILE_TYPES.imagesMaxSize && FILE_TYPES.imagesReg.test(file.type);
                }
            }

            return {
                Attachment,
                ImageAttachment
            };
        });
};
