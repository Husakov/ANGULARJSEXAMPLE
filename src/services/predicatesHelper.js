module.exports = function (module) {
    module
        .factory('predicatesHelper', function (attributesHelper) {
            'ngInject';

            const orType = 'or';

            const modes = {
                list: ['user', 'lead', 'visitor', 'company'],
                attributeName: 'role',
                getPredicateFor(mode) {
                    switch (mode) {
                        case 'user':
                        case 'lead':
                        case 'visitor':
                            return {
                                type: 'string',
                                attribute: this.attributeName,
                                comparison: 'eq',
                                value: mode
                            };
                        default:
                            break;
                    }
                },
                getModeFromPredicates(predicates = []) {
                    let mode;
                    predicates = predicates.filter(p => {
                        if (p.attribute === this.attributeName) {
                            mode = p.value;
                            return false;
                        }
                        return true;
                    });
                    return {mode, predicates};
                },
                modeAttribute: {
                    name: 'mode',
                    title: 'Type',
                    icon: 'users',
                    type: 'mode',
                    description: 'A user (signed up and logged in), a lead (not logged in) or a visitor'
                },
                getModePredicate(mode) {
                    return {
                        type: 'mode',
                        comparison: mode,
                        attribute: 'mode',
                        active: mode && mode !== 'company'
                    }
                }
            };

            class PredicatesWrapper {

                static filter(predicates, filter) {
                    let newPredicates = [];
                    PredicatesWrapper.forEach(predicates, (p, path) => {
                        if (filter(p)) {
                            PredicatesWrapper.setToPath(newPredicates, angular.copy(p), path);
                        }
                    });
                    PredicatesWrapper.normalize(newPredicates);
                    return newPredicates;
                }

                static forEach(predicates, action, path = []) {
                    return predicates
                        .some((predicate, index) => {
                            let newPath = path.concat([index]);
                            if (predicate.predicates) {
                                return PredicatesWrapper.forEach(predicate.predicates, action, newPath);
                            } else {
                                return action(predicate, newPath);
                            }
                        });
                }

                static isEqual(predicatesA, predicatesB) {
                    if (!angular.isArray(predicatesA) || !angular.isArray(predicatesB)) {
                        return angular.equals(predicatesA, predicatesB);
                    }

                    if (predicatesA.length !== predicatesB.length) {
                        return false;
                    }

                    return !predicatesA
                        .some(pA => {
                            let isOrA = !!pA.predicates;
                            return !predicatesB
                                .some(pB => {
                                    let isOrB = !!pB.predicates;
                                    if (isOrA === isOrB) {
                                        return isOrA ? PredicatesWrapper.isEqual(pA.predicates, pB.predicates) : angular.equals(pA, pB);
                                    }
                                });
                        });
                }

                static getFromPath(predicates, path) {
                    if (path.length === 0) {
                        return null;
                    }
                    let predicate = predicates[path[0]];
                    path = path.slice(1);
                    return path.length > 0 ? PredicatesWrapper.getFromPath(predicate.predicates, path) : predicate;
                }

                static setToPath(predicates = [], predicate, path) {
                    if (!path || path.length === 0) {
                        return;
                    }
                    if (path.length === 1) {
                        predicates[path[0]] = predicate;
                    } else {
                        let index = path[0];
                        path = path.slice(1);
                        if (!predicates[index] || !predicates[index].predicates) {
                            predicates[index] = {type: orType, predicates: []};
                        }
                        PredicatesWrapper.setToPath(predicates[index].predicates, predicate, path);
                    }
                }

                static getPath(predicates, predicate) {
                    let path = null;
                    PredicatesWrapper.forEach(predicates, (p, currentPath) => {
                        if (p === predicate) {
                            path = currentPath;
                            return true;
                        }
                    });
                    return path;
                }

                static normalize(predicates) {
                    for (let len = predicates.length - 1; len >= 0;) {
                        let p = predicates[len];
                        if (!p) {
                            predicates.splice(len, 1);
                        } else {
                            if (p.predicates) {
                                if (p.predicates.length > 1) {
                                    PredicatesWrapper.normalize(p.predicates);
                                } else if (p.predicates.length > 0) {
                                    predicates.splice(len, 1, p.predicates[0]);
                                    continue;
                                } else {
                                    predicates.splice(len, 1);
                                }
                            }
                        }
                        len--;
                    }
                }
            }


            class PredicatesHelper {
                constructor() {
                    this.modeAttribute = modes.modeAttribute;
                }

                togglePredicatesRule(predicates, predicate) {
                    function wrap(predicates) {
                        return {
                            type: orType,
                            predicates
                        };
                    }

                    function moveFrom(fromArray) {
                        let prevPredicate = predicates[parentIndex - 1];
                        fromArray.splice(index, 1);
                        if (prevPredicate.predicates) {
                            prevPredicate.predicates.push(predicate);
                        } else {
                            predicates.splice(parentIndex - 1, 1, wrap([prevPredicate, predicate]));
                        }
                    }

                    let path = PredicatesWrapper.getPath(predicates, predicate),
                        [parentIndex, index = parentIndex] = path,
                        parentPredicate = predicates[parentIndex];
                    if (parentIndex === 0 && index === 0 || path.length > 2) {
                        return;
                    }
                    if (path.length === 1) {
                        moveFrom(predicates);
                    } else if (index === 0) {
                        moveFrom(parentPredicate.predicates);
                    } else if (index === parentPredicate.length - 1) {
                        parentPredicate.predicates.slice(index, 1);
                        predicates.splice(parentIndex + 1, 0, predicate);
                    } else {
                        predicates.splice(parentIndex + 1, 0, predicate, wrap(parentPredicate.predicates.slice(index + 1)));
                        parentPredicate.predicates.splice(index);
                    }

                    PredicatesWrapper.normalize(predicates);
                }

                removePredicate(predicates, predicate) {
                    let basePredicates = predicates;
                    let path = PredicatesWrapper.getPath(predicates, predicate);
                    if (!path || path.length === 0) {
                        return;
                    }
                    if (path.length > 1) {
                        predicates = PredicatesWrapper.getFromPath(predicates, path.slice(0, -1)).predicates;
                    }
                    predicates.splice(path[path.length - 1], 1);
                    PredicatesWrapper.normalize(basePredicates);
                }

                isPredicatesEqual(...args) {
                    return PredicatesWrapper.isEqual(...args);
                }

                getPredicatesInfo(value, attributesCategories) {
                    let mode,
                        allAttributes = attributesHelper.getAttributesFromCategories(attributesCategories),
                        predicates,
                        attributes = [];

                    ({mode, predicates: predicates} = modes.getModeFromPredicates(value));
                    predicates = angular.copy(predicates);

                    PredicatesWrapper.forEach(predicates, p => {
                        let a = _.find(allAttributes, {name: p.attribute});
                        if (a) {
                            attributes.push(a);
                        }
                    });
                    return {
                        predicates,
                        attributes,
                        mode
                    };
                }

                combinePredicates({predicates, mode}) {
                    let result = angular.copy(predicates),
                        modePredicate = modes.getPredicateFor(mode);
                    if (modePredicate) {
                        result.push(modePredicate);
                    }
                    return result;
                }

                isValidPredicate(p) {
                    if (p.attribute === modes.attributeName) {
                        return false;
                    } else if (['known', 'unknown'].includes(p.comparison)) {
                        return true;
                    } else if (angular.isObject(p.value)) {
                        let {year, month, day} = p.value;
                        return ![year, month, day]
                            .some(value => !angular.isNumber(value) || isNaN(value));
                    } else if (p.comparison && angular.isDefined(p.value) && p.value !== '' && !_.isNull(p.value)) {
                        return true;
                    }
                    return false;
                }

                getValidPredicates(predicates) {
                    return PredicatesWrapper.filter(predicates, p => this.isValidPredicate(p));
                }

                getModePredicate(mode) {
                    return modes.getModePredicate(mode);
                }
            }

            return new PredicatesHelper();
        });
};
