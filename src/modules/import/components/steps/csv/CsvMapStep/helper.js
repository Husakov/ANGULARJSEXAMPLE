module.exports = function (module) {
    module
        .factory('ImportCsvCsvMapHelper', function (attributesHelper, pubSub) {
            'ngInject';

            const constants = require('../constants');

            class Column {
                constructor(values, index) {
                    this.isMapped = false;
                    this.values = values;
                    this.index = index;

                    this.isSelected = false;
                }

                map({name, title, type}) {
                    this.name = name;
                    this.title = title;
                    this.type = type;
                }

                unmap() {
                    delete this.title;
                    delete this.name;
                    delete this.type;
                    this.isMapped = false;
                }
            }

            let attributes = [];

            function initAttributes() {
                attributes.$promise = attributesHelper
                    .getAttributesByCategories()
                    .then(({customAttributes}) => {
                        attributes.splice(0, attributes.length, ...customAttributes.attributes);
                    });
                return attributes.$promise;
            }

            initAttributes();

            class Helper extends pubSub.EventEmitter {
                constructor(recipients, values, onReady) {
                    super();
                    this.dataTypes = constants.dataTypes;
                    this.steps = constants.assignSteps[recipients];
                    this.total = this.steps.length;
                    this.values = values;
                    this.onReady = onReady;

                    this.setAttributes();
                    this.selectedAttributes = [];

                    this.isValid = false;

                    this.columns = values.map((v, i) => new Column(v, i));

                    this.index = 0;
                    this.initStep();
                }

                toggle(col, state = true) {
                    this.columns
                        .forEach(c => c.isSelected = c === col && state);
                    this.emit('toggle', col, state);
                }

                map(col) {
                    this.toggle(col, false);
                    col.isMapped = true;
                    if (this.step().isCustom) {
                        if (this.isNewAttribute) {
                            attributesHelper
                                .newAttribute(this.mapData.title, this.mapData.type.name)
                                .then(attr => {
                                    angular.extend(col, {
                                        name: attr.name,
                                        title: attr.title,
                                        type: _.find(this.dataTypes, t => t.name === attr.type)
                                    });
                                    this.selectedAttributes.push(attr);
                                    this.emit('update', col);
                                    return initAttributes();
                                })
                                .then(() => this.setAttributes());
                            this.newAttribute(false);
                        }
                        this.selectedAttributes.push(this.selectedAttribute);
                        this.selectedAttribute = null;
                        this.setAttributes();
                    }

                    col.map(this.mapData);
                    this.mapData = null;

                    if (!this.step().isCustom) {
                        this.next()
                    }
                }

                canConfirm() {
                    if (!this.mapData) {
                        return false;
                    }
                    let mapData = this.mapData;
                    return mapData.title && mapData.title.length > 0 && !!mapData.type;
                }

                back() {
                    if (this.step().isCustom && this.selectedAttributes.length > 0) {
                        let attr = this.selectedAttributes.splice(this.selectedAttributes.length - 1, 1)[0],
                            col = _.find(this.columns, {name: attr.name});
                        if (col) {
                            col.unmap();
                        }

                        this.selectedAttribute = null;
                        this.setAttributes();
                    } else {
                        this.index--;
                        this.toggle(null, false);
                        const step = this.step();
                        if (!step.isCustom) {
                            let col = _.find(this.columns, {name: step.name});
                            if (col) {
                                col.unmap();
                            }
                        }

                    }
                    this.initStep();
                }

                next() {
                    this.index++;
                    this.initStep();
                }

                goTo(index) {
                    if (index < 0 || index > this.index) {
                        return false;
                    }

                    if (index < this.index) {
                        for (let i = this.index; i > index; i--) {
                            this.back();
                        }
                    }

                    return true;
                }

                finish() {
                    this.isValid = true;
                    this.onReady();
                }

                initStep() {
                    const step = this.step();
                    if (!step.isCustom) {
                        this.mapData = {
                            name: step.name,
                            title: step.title,
                            type: step.dataType
                        };
                    }
                }

                selectAttribute(item) {
                    this.selectedAttribute = item;
                    this.setAttributes();
                    this.mapData = {
                        name: item.name,
                        title: item.title || item.name,
                        type: _.find(this.dataTypes, t => t.name === item.type)
                    };
                }

                setAttributes() {
                    attributes
                        .$promise
                        .then(() => {
                            let ids = _.pluck(this.selectedAttributes, 'id');
                            if (this.selectedAttribute) {
                                ids.push(this.selectedAttribute.id);
                            }
                            this.attributes = attributes
                                .filter(a => !ids.includes(a.id));
                        });
                }

                newAttribute(activate = true) {
                    this.selectedAttribute = null;
                    this.setAttributes();
                    this.isNewAttribute = activate;
                    this.mapData = {
                        name: null,
                        title: null,
                        type: null
                    };
                }

                getAssignments() {
                    return _(this.columns)
                        .filter(c => c.isMapped)
                        .map(c => ({
                            column_name: c.name,
                            column_index: c.index,
                            data_type: c.type.key
                        }))
                        .value();
                }

                step() {
                    return this.steps[this.index];
                }
            }

            return Helper;
        });
};
