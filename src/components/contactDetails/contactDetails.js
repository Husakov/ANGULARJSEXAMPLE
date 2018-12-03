require('./contactDetails.scss');

function isCompanies(mode) {
    return mode === 'companies';
}

function isEmpty(value) {
    return _.isUndefined(value) || _.isNull(value);
}

class Controller {
    constructor(contactDetailsSections, contactPredicatesHelper, Users, Companies, $scope, $q, slidePanelManager) {
        'ngInject';
        this.contactDetailsSections = contactDetailsSections;
        this.contactPredicatesHelper = contactPredicatesHelper;
        this.Users = Users;
        this.Companies = Companies;
        this.$scope = $scope;
        this.$q = $q;

        this.tagPanel = slidePanelManager.render({
            template: '<tag-search done="$ctrl.resolveTags({tags: tags})" existed="$ctrl.contact.tags"></tag-search>',
            background: true,
            slideAppContainer: true,
            $scope: $scope.$new()
        });

        this.loading = false;
        this.isCompanies = isCompanies();
    }

    $onChanges({mode, contact}) {
        if (mode) {
            this.isCompanies = isCompanies(mode.currentValue);
            this.contactDetailsSections.getSectionsByMode(mode.currentValue).then((sections) => this.sections = sections);
        }

        if (contact && contact.currentValue) {
            this.initContact()
                .then(() => {
                    if (!contact.isFirstChange()) {
                        this.$scope.$broadcast('recompile');
                    }
                });
        }
    }

    initContact() {
        this.loading = true;
        return this.$q.when(this.contact.$promise || this.contact)
            .then(() => {
                this.loading = false;
            });
    }

    getData(item, el) {
        let data = {
            value: _.get(el || this.contact, item.name)
        };

        if (item.type || item.editable) {
            data.type = item.editable ? 'editable' : item.type;
        }

        if (item.type && !isEmpty(data.value)) {
            switch (item.type) {
                case 'boolean':
                    data.value = data.value ? 'true' : 'false';
                    break;
                case 'integer':
                    data.value = '' + data.value;
                    break;
            }
        }

        if (isEmpty(data.value)) {
            data.placeholder = _.isString(item.placeholder) ? item.placeholder : 'Unknown';
            data.isPlaceholder = true;
        }

        return data;
    }

    initArray(section) {
        let data = {
            elements: _.get(this.contact, section.property || section.name, [])
        };
        return data;
    }

    initList(section) {
        let data = {
            elements: _.get(this.contact, section.property || section.name, []),
            icon: el => _.result(el, 'icon', section.icon),
            hasAdd: !!section.addLabel
        };

        if (section.visibilityProperty) {
            section.visibilityState = false;
        }

        if (data.hasAdd) {
            data.addLabel = section.addLabel;
        }

        if (section.name === 'tags') {
            data.add = () => this.tagPanel.toggle()
        }

        return data;
    }

    getUrl(item, section, el) {
        let attribute = section.type ? [section.name, item.name].join('.') : item.name,
            value = _.get(el || this.contact, item.name),
            type = item.type;

        if (type === 'date') {
            value = new Date(value);
            value = this.contactPredicatesHelper.adaptDateToObject(value)
        }
        if (!type || type === 'editable') {
            type = 'string';
        }

        return this.contactPredicatesHelper
            .generateUrlForPredicate({
                value: value,
                type: type,
                attribute,
                comparison: value ? 'eq' : 'unknown'
            }, this.mode);
    }

    setAttribute(item, value) {
        const oldValue = _.get(this.contact, item.name);
        _.set(this.contact, item.name, value);
        this.contact.$update()
            .catch(() => {
                _.set(this.contact, item.name, oldValue);
            });
    }

    resolveTags({tags}) {
        this.tagPanel.toggle(false);
        let tag_ids = _.pluck(tags, 'id'),
            resource = this.isCompanies ? this.Companies : this.Users;

        this.update(
            resource.update_tags({id: this.contact.id, tag_ids})
                .$promise
        );
    }

    update(promise = this.$q.resolve()) {
        this.loading = true;
        promise
            .then(() => this.contact.$get())
            .then(() => this.loading = false);
    }
}

const mod = angular.module('intercom.components.contactsDetails', []);

mod.component('contactsDetails', {
    templateUrl: require('./index.html'),
    controller: Controller,
    bindings: {
        contact: '<',
        mode: '<'
    }
});

require('./contactDetails.constants')(mod);
require('./visiblility/visibility')(mod);

module.exports = mod;
