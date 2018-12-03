module.exports = function (module) {
    const templateUrl = require('./index.html');


    class Controller {
        constructor($filter) {
            'ngInject';
            this.$filter = $filter;

            this.ready = false;
        }

        $onInit() {
            this.ready = true;
        }

        getColData(item, attribute) {
            let prop = this.getAttrName(attribute),
                isCompany = prop.includes('company'),
                result;

            if (isCompany) {
                item = item.companies;
                prop = this.getAttrName(attribute, true);
            }

            switch (prop) {
                case 'tag_ids':
                    prop = 'tags';
                    break;
                case 'segment_ids':
                    prop = 'segments';
                    break;
                default:
                    break;
            }

            if (angular.isArray(item)) {
                result = _(item).chain().pluck(prop).uniq().compact().value();
            } else {
                result = _.get(item, prop);
            }
            if (angular.isArray(result)) {
                if (result.length > 0 && angular.isObject(result[0])) {
                    result = _(result).chain().pluck('name').uniq().compact().value();
                }
                if (result.length === 0) {
                    result = null;
                }
            }
            return result;
        }

        getAttrName(attribute, isCompany = false) {
            let name = attribute.name;
            return (isCompany || this.main.isCompanies()) ? name.replace('company.', '') : name;
        }

        getAttrSection(attribute) {
            let name = this.getAttrName(attribute);
            if (name === 'name') {
                return 'name';
            }
            if (['tag_ids', 'segment_ids'].includes(name) || name.includes('company')) {
                return 'list';
            }
            return 'default';
        }

        getListString(list, attribute, cut = false) {
            let result;
            if (attribute.type === 'date') {
                let dateFilter = this.$filter('date');
                list = list.map(d => dateFilter(d, 'medium'));
            }

            if (cut) {
                result = _.take(list, 2).join(', ');
                result = list.length > 2 ? result + ` and ${list.length - 2} more` : result;
            } else {
                result = list.join(', ');
            }
            return result;
        }
    }

    module
        .component('contactsListTableBody', {
            templateUrl,
            controller: Controller,
            bindings: {
                main: '<'
            }
        });
};
