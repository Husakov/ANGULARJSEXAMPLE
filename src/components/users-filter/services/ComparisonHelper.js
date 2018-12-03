module.exports = function (mod) {
    mod
        .factory('UsersFilterComparisonHelper', function (COMPARISONS, Tags, Segment, pubSub, moment) {
            'ngInject';

            const dropdownItems = {
                tags: Tags.query(),
                segments: Segment.query()
            };

            function getComparisonsType(attribute) {
                return attribute.hyper_type || attribute.type;
            }

            function getComparisons(type) {
                return COMPARISONS[type];
            }

            function getDropdownItems(attribute) {
                if (['tag_ids', 'company.tag_ids'].includes(attribute.name)) {
                    return dropdownItems.tags;
                }
                if (['segment_ids', 'company.segment_ids'].includes(attribute.name)) {
                    return dropdownItems.segments;
                }
            }

            function isNotCorrectType(compirison, value) {
                return (compirison.input === 'date' && !_.isObject(value)) ||
                    (compirison.input !== 'date' && _.isObject(value));
            }

            const formatters = {
                date: {
                    $parsers: [function (value) {
                        if (!_.isDate(value)) {
                            return {};
                        }
                        return {
                            year: value.getFullYear(),
                            month: value.getMonth(),
                            day: value.getDate()
                        };
                    }],
                    $formatters: [function (model) {
                        if (_.isObject(model)) {
                            let value = new Date();
                            value.setFullYear(model.year);
                            value.setMonth(model.month);
                            value.setDate(model.day);
                            return value;
                        } else {
                            return null;
                        }
                    }],
                    $validators: {
                        date: function (modelValue = {}, viewValue) {
                            if (!modelValue || !viewValue) {
                                return false;
                            }
                            let {year, month, day} = modelValue;
                            return ![year, month, day]
                                .some(value => !angular.isNumber(value) || isNaN(value));
                        }
                    }
                }
            };

            const transforms = {
                getTransform: function (from, to) {
                    let key = _.camelCase([from, 'to', to].join(' '));
                    return _.has(this, key) ? this[key] : null;
                },
                dateToNumber: function (value) {
                    return value ? moment().diff([value.year, value.month, value.day], 'days') : 0;
                },
                numberToDate: function (value) {
                    let date = new Date();
                    date.setDate(date.getDate() - value);
                    return {
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: date.getDate()
                    };
                },
                toDate: function (value) {
                    return value || {};
                }
            };

            class ComparisonHelper extends pubSub.EventEmitter {
                constructor(attribute) {
                    super();
                    this.attribute = attribute;

                    this.type = getComparisonsType(attribute);
                    this.comparisons = getComparisons(this.type);
                }

                setComparison(comparison) {
                    this.comparison = comparison;
                    this.emit('changed');
                }

                setComparisonByPredicate(predicate) {
                    let {comparison: name, value} = predicate,
                        comparison = _.find(this.comparisons, c => {
                            if (isNotCorrectType(c, predicate.value)) {
                                return false;
                            } else if (angular.isDefined(c.value)) {
                                return c.name === name && c.value === value;
                            } else {
                                return c.name === name;
                            }
                        });
                    if (comparison && !angular.equals(this.comparison, comparison)) {
                        this.setComparison(comparison);
                    }
                }

                getInputType(oldInputType = {}) {
                    if (!this.comparison.input) {
                        return null;
                    }
                    let inputType;

                    if (this.comparison.input === 'date') {
                        inputType = {
                            template: 'date',
                            type: 'date',
                            formatter: formatters.date
                        };
                    } else if (angular.isString(this.comparison.input)) {
                        inputType = {
                            template: 'input',
                            type: this.comparison.input
                        };
                    } else {
                        inputType = {
                            template: 'dropdown',
                            items: getDropdownItems(this.attribute)
                        };
                    }

                    if (this.comparison.trail) {
                        inputType.inputTrail = this.comparison.trail;
                    }

                    let trasform = transforms.getTransform(oldInputType.type, inputType.type);
                    if (trasform) {
                        inputType.transform = trasform;
                    }
                    return inputType;
                }

                getComparisonByName(name) {
                    return _.find(this.comparisons, {name});
                }

                getGroup(key) {
                    if (key !== 'undefined') {
                        return {
                            name: key
                        };
                    }
                }
            }

            return ComparisonHelper;
        });
};
