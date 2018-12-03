module.exports = function (module) {
    module
        .factory('MessagesMessageModel', function (messagesMessageRules, Dispatch, pubSub, $q, $log) {
            'ngInject';
            const rules = messagesMessageRules;

            class MessageModel extends pubSub.EventEmitter {
                constructor(model) {
                    super();
                    let {id} = model;
                    this.$promise = $q.resolve();
                    if (id) {
                        this._model = Dispatch.get({id: id});
                        this.$promise = this.$promise
                            .then(() => this._model.$promise);
                    } else {
                        this._model = new Dispatch(rules.getNewModel(model));
                    }

                    this.$promise = this.$promise
                        .then(() => this._options = rules.getOptions(this._model))
                        .then(() => rules.runRules(this._model, this._options))
                        .then(() => this);

                    this.currentVersionIndex = 0;

                    this._getterSetters = {};
                    this._getterSettersOptions = {};

                    this.on('$update', () => { // TODO: fix it -> because of event listener, this object never dies
                        rules.runRules(this._model, this._options);
                    })
                }

                _versionGetter(originName, index = this.currentVersionIndex) {
                    let origin = originName === 'model' ? this._model : this._options;
                    return origin.variations && origin.variations[index];
                }

                _getter(originName, prop, isFromVersion = false, versionIndex = this.currentVersionIndex) {
                    let origin = originName === 'model' ? this._model : this._options,
                        target = isFromVersion ? this._versionGetter(originName, versionIndex) : origin;
                    return _.get(target, prop);
                }

                _setter(originName, prop, value, isFromVersion, versionIndex = this.currentVersionIndex) {
                    let method = originName === 'model' ? 'setModelValue' : 'setOptionsValue';
                    rules[method](this._model, this._options, {
                        prop,
                        value,
                        isFromVersion,
                        versionIndex: versionIndex
                    });
                }

                _getterSetter(originName, prop, isFromVersion = false, versionIndex = this.currentVersionIndex) {
                    let originSetters = originName === 'model' ? this._getterSetters : this._getterSettersOptions;
                    let key = isFromVersion ? versionIndex + '.' + prop : prop;
                    if (!originSetters[key]) {
                        originSetters[key] = (...args) => {
                            if (args.length > 0) {
                                this._setter(originName, prop, args[0], isFromVersion, versionIndex);
                            }
                            return this._getter(originName, prop, isFromVersion, versionIndex);
                        }
                    }
                    return originSetters[key];
                }

                get(prop, isFromVersion = false, versionIndex = this.currentVersionIndex) {
                    return this._getter('model', prop, isFromVersion, versionIndex);
                }

                set(prop, value, isFromVersion, versionIndex = this.currentVersionIndex) {
                    this._setter('model', prop, value, isFromVersion, versionIndex);
                }

                options(prop, isFromVersion, versionIndex = this.currentVersionIndex) {
                    return this._getter('options', prop, isFromVersion, versionIndex);
                }

                optionsSet(prop, value, isFromVersion, versionIndex = this.currentVersionIndex) {
                    this._setter('options', prop, value, isFromVersion, versionIndex);
                }

                getterSetter(prop, isFromVersion = false, versionIndex = this.currentVersionIndex) {
                    return this._getterSetter('model', prop, isFromVersion, versionIndex);
                }

                optionsGetterSetter(prop, isFromVersion = false, versionIndex = this.currentVersionIndex) {
                    return this._getterSetter('options', prop, isFromVersion, versionIndex);
                }

                getVersion(index = this.currentVersionIndex) {
                    return this._versionGetter('model', index);
                }

                getOptionsVersion(index = this.currentVersionIndex) {
                    return this._versionGetter('options', index);
                }

                deleteVersion(index = this.currentVersionIndex) {
                    this._options.variations.splice(index, 1);
                    this._model.variations.splice(index, 1);
                    if (index <= this.currentVersionIndex) {
                        this.currentVersionIndex -= 1;
                        this.currentVersionIndex = this.currentVersionIndex >= 0 ? this.currentVersionIndex : 0;
                    }
                }

                addVersion() {
                    this._model.variations.push(rules.getNewVersion(this.getVersion()));
                    this._options.variations.push(rules.getNewOptionsVersion(this.getOptionsVersion()));
                    this.setVersion(this._model.variations.length - 1);
                }

                setVersion(index) {
                    this.currentVersionIndex = index;
                }

                $save() {
                    let promise = $q.resolve();
                    return promise
                        .then(() => rules.beforeSave(this._model, this._options))
                        .then(() => this._model.$save())
                        .then(() => this.emit('$save'))
                        .then(() => this)
                        .catch(err => {
                            $log.error(err);
                            return $q.reject(err);
                        });
                }

                $update() {
                    let promise = $q.resolve();
                    return promise
                        .then(() => rules.beforeSave(this._model, this._options))
                        .then(() => this._model.$update())
                        .then(() => this.emit('$update'))
                        .then(() => this)
                        .catch(err => {
                            $log.error(err);
                            return $q.reject(err);
                        });
                }

                $delete() {
                    return Dispatch
                        .delete({id: this._model.id})
                        .$promise
                        .then(() => this.emit('$delete'))
                        .then(this);
                }

                $send() {
                    let promise = $q.resolve();
                    return promise
                        .then(() => rules.beforeSend(this._model, this._options))
                        .then(() => Dispatch.send(this._model).$promise)
                        .then(() => this.emit('$send'))
                        .then(() => this);
                }

                $sendToEmail(options) {
                    return Dispatch.sendToEmail(options).$promise
                        .then(() => this.emit('$sendToEmail'))
                        .then(() => this);
                }

                $setLive(versionIndex, state = true) {
                    let promise = $q.resolve(),
                        method = state ? 'startLive' : 'stopLive',
                        params = {id: this._model.id};
                    if (_.isNumber(versionIndex)) {
                        method += 'Version';
                        params.index = versionIndex;
                    }
                    return promise
                        .then(() => rules.beforeSend(this._model, this._options))
                        .then(() => Dispatch[method](params, {}).$promise)
                        .then(() => this.emit('$setLive'))
                        .then(() => this)
                        .catch(err => {
                            $log.error(err);
                            return $q.reject(err);
                        })
                        .finally(() => {
                            this._model.$get()
                                .then(() => this.emit('$update'))
                        });
                }

                $deleteVersion(versionIndex) {
                    let promise;
                    if (this.options('isNew')) {
                        this.deleteVersion(versionIndex);
                        promise = $q.resolve();
                    } else {
                        promise = Dispatch
                            .deleteVersion({id: this._model.id, index: versionIndex})
                            .$promise
                            .then(() => this._model.$get());
                    }
                    return promise
                        .then(() => this.emit('$update'))
                        .then(() => this)
                        .catch(err => {
                            $log.error(err);
                            return $q.reject(err);
                        });
                }

                copy() {
                    return MessageModel.copy(this);
                }

                static copy(model) {
                    if (model instanceof MessageModel) {
                        model = model._model;
                    }
                    if (model instanceof Dispatch) {
                        model = model.toJSON();
                    }

                    let copy = angular.copy(model);
                    delete copy.id;
                    copy.state = 'draft';
                    copy.variations
                        .forEach(v => v.state = 'draft');
                    return copy;
                }
            }

            return MessageModel;
        });
};
