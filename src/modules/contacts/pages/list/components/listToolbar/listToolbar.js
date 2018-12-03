module.exports = function (module) {
    require('./listToolbar.scss');

    class Controller {
        constructor() {
            'ngInject';
        }

        onSearch(name, tagId) {
            let newPredicate = null;
            if (name) {
                newPredicate = {
                    value: name,
                    attribute: 'name',
                    comparison: 'contains'
                }
            } else if (tagId) {
                newPredicate = {
                    value: tagId,
                    attribute: 'tag_ids',
                    comparison: 'eq'
                }
            }

            if (newPredicate) {
                angular.merge(newPredicate, {type: 'string', is_company: this.main.isCompanies()});
            }
            this.main.search(newPredicate);
        }

    }

    module
        .component('contactsListToolbar', {
            templateUrl: require('./index.html'),
            controller: Controller,
            bindings: {
                main: '<'
            }
        });
};
