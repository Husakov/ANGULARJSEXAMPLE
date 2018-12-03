module.exports = function (module) {
    module
        .factory('attributesHelper', function (Attributes, Profile, Admin) {
            'ngInject';

            const currentUser = Profile.get();

            function wrapAttributesCategory(name, attributes, title) {
                return {
                    name,
                    title,
                    attributes
                };
            }

            function getPureAttributeName(name) {
                if (!angular.isString(name)) {
                    name = name.name;
                }
                return name;
            }

            class VisibleAttributes {
                constructor() {
                    this.modeProps = {};
                }

                setVisible(categories, mode) {
                    if (!this.modeProps[mode]) {
                        this.modeProps[mode] = this.getModeProps(mode);
                    }
                    this.setVisibleArray(mode, this.getVisible(categories));
                    this.saveVisibles(mode);
                }

                getVisible(categories) {
                    let attributes = [];
                    Object.keys(categories).forEach(key => {
                        categories[key].attributes.forEach(attribute => {
                            if (attribute.visible) {
                                attributes.push(attribute);
                            }
                        });
                    });
                    return attributes;
                }

                setVisibleArray(mode, categories) {
                    this.modeProps[mode].visibleNames = categories
                        .map(attribute => {
                            let name = attribute.name;
                            if (attribute.is_custom) {
                                name = 'custom_data.' + name;
                            }
                            return name;
                        });
                }

                saveVisibles(mode) {
                    let props = this.modeProps[mode];
                    if (!props.lastRequestPromise) {
                        props.lastRequestPromise = Admin[props.method]({}, {
                            [props.property]: props.visibleNames
                        })
                            .$promise
                            .then(() => {
                                Profile.sync();
                            })
                            .then(() => {
                                props.lastRequestPromise = null;
                                if (props.doAgain) {
                                    props.doAgain = false;
                                    this.saveVisibles(mode);
                                }
                            });
                    } else {
                        props.doAgain = true;
                    }
                }

                getModeProps(mode) {
                    let props;
                    switch (mode) {
                        case 'companies':
                            props = {
                                method: 'updateCompanyColumns',
                                property: 'company_columns'
                            };
                            break;
                        case 'users':
                            props = {
                                method: 'updateUserColumns',
                                property: 'user_columns'
                            };
                            break;
                        default:
                            props = {};
                            break;
                    }
                    return props;
                }
            }

            let visibleAttributes = new VisibleAttributes();

            class AttributesHelper {
                getAttributesByCategories(mode = 'visitor') {
                    let isCompanies = ['company', 'companies'].includes(mode),
                        visibleColumns = _.map(
                            isCompanies ? currentUser.visible_company_columns : currentUser.visible_user_columns,
                            name => getPureAttributeName(name)
                        );

                    return Attributes.query()
                        .$promise
                        .then(attributes => {
                            let userAttributes = [],
                                companyAttributes = [],
                                mobileAttributes = [],
                                customAttributes = [],
                                visitorAttributes = [];

                            attributes.forEach(attribute => {
                                let decoratedAttribute = angular.extend({}, attribute, {
                                    allowHide: !['name', 'company.name'].includes(attribute.name),
                                    visible: visibleColumns.includes(getPureAttributeName(attribute))
                                });

                                if (attribute.is_company) {
                                    companyAttributes.push(
                                        angular.extend({}, decoratedAttribute, {
                                            icon: 'building',
                                            name: getPureAttributeName(attribute)
                                        })
                                    );
                                } else if (attribute.is_custom) {
                                    customAttributes.push(
                                        angular.extend({}, decoratedAttribute, {
                                            icon: 'exchange'
                                        })
                                    );
                                } else if (attribute.is_mobile) {
                                    mobileAttributes.push(
                                        angular.extend({}, decoratedAttribute, {
                                            icon: 'mobile'
                                        })
                                    );
                                } else {
                                    userAttributes.push(
                                        angular.extend({}, decoratedAttribute, {
                                            icon: 'users'
                                        })
                                    );
                                }

                                if (attribute.is_visitor) {
                                    visitorAttributes.push(
                                        angular.extend({}, attribute, {
                                            icon: 'globe'
                                        })
                                    );
                                }
                            });

                            return {
                                userAttributes: wrapAttributesCategory(
                                    'user',
                                    userAttributes,
                                    'User Data'
                                ),
                                companyAttributes: wrapAttributesCategory(
                                    'company',
                                    companyAttributes,
                                    'Company Data'
                                ),
                                mobileAttributes: wrapAttributesCategory(
                                    'mobile',
                                    mobileAttributes,
                                    'Mobile Data'
                                ),
                                customAttributes: wrapAttributesCategory(
                                    'custom',
                                    customAttributes,
                                    'Custom Data'
                                ),
                                visitorAttributes: wrapAttributesCategory(
                                    'visitor',
                                    visitorAttributes,
                                    'Visitor Data'
                                )
                            };
                        });
                }

                getAttributesFromCategories(attributesCategories) {
                    let attributes = [],
                        names = [];

                    Object.keys(attributesCategories).forEach(k => {
                        let attrs = attributesCategories[k].attributes;
                        attrs.forEach(a => {
                            if (!names.includes(a.name)) {
                                attributes.push(a);
                                names.push(a.name);
                            }
                        })
                    });

                    return attributes;
                }

                setVisible(categories, mode) {
                    visibleAttributes.setVisible(categories, mode);
                }

                getVisible(categories) {
                    return visibleAttributes.getVisible(categories);
                }

                newAttribute(title, type) {
                    let attr = new Attributes({
                        title,
                        type,
                        name: 'custom_data.' + _.snakeCase(title)
                    });
                    return attr
                        .$save()
                        .then(() => Attributes.clearCache())
                        .then(() => Attributes.query())
                        .then(() => attr);
                }
            }

            return new AttributesHelper();
        });
};
