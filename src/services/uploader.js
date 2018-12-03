module.exports = function (module) {
    module
        .factory('Uploader', function (FileUploader, auth, $q, CONFIG) {
            'ngInject';

            class Uploader {
                constructor(url) {
                    this._uploader = new FileUploader({
                        url: CONFIG.apiUrl + '/' + url,
                        headers: {
                            'X-Token': auth.getToken()
                        },
                        onErrorItem: this._onErrorItem.bind(this),
                        onCompleteAll: this._onCompleteAll.bind(this),
                        onProgressItem: this._onProgressItem.bind(this),
                        onCancelItem: this._onCancelItem.bind(this),
                        onSuccessItem: this._onSuccessItem.bind(this),
                        onBeforeUploadItem: this._onBeforeUploadItem.bind(this),
                        removeAfterUpload: true
                    });

                    this.queue = [];

                }

                addToQueue(files) {
                    let self = this;
                    if (angular.isArray(files)) {
                        let promises = [];
                        files.forEach(file => promises.push(add(file)));
                        return $q.all(promises);
                    } else {
                        return add(files);
                    }

                    function add(file) {
                        let defer = $q.defer();
                        self._uploader.addToQueue(file);

                        self.queue.push({
                            file: file,
                            defer: defer
                        });
                        return defer.promise;
                    }
                }

                uploadAll() {
                    if (this._uploader.queue.length > 0) {
                        this._uploader.uploadAll();
                    }
                }

                cancel(file) {
                    let defer = $q.defer();
                    let obj = this.queue.find(item => file === item.file);
                    if (obj) {
                        this._uploader.cancelItem(obj._uploadIndex);
                        _.pull(this.queue, obj);
                        defer.resolve(true);
                    } else {
                        defer.reject();
                    }
                    return defer.promise;
                }

                _onSuccessItem(fileItem, response) {
                    let obj = this.queue.find(item => fileItem._file === item.file);
                    if (obj) {
                        obj.defer.resolve(response);
                    }
                }

                _onErrorItem(fileItem, response) {
                    let obj = this.queue.find(item => fileItem._file === item.file);
                    if (obj) {
                        _.pull(this.queue, obj);
                        obj.defer.reject(response);
                    }
                }

                _onProgressItem(fileItem, progress) {
                    let obj = this.queue.find(item => fileItem._file === item.file);
                    if (obj) {
                        obj.defer.notify(progress);
                    }
                }

                _onCancelItem(fileItem, response) {
                    let obj = this.queue.find(item => fileItem._file === item.file);
                    if (obj) {
                        obj.defer.reject(response);
                    }
                }

                _onBeforeUploadItem(fileItem) {
                    let obj = this.queue.find(item => fileItem._file === item.file);
                    if (obj) {
                        obj._uploadIndex = this._uploader.getIndexOfItem(fileItem);
                    }
                }

                _onCompleteAll() {
                    this.queue = [];
                }

            }

            return Uploader;
        });
};
