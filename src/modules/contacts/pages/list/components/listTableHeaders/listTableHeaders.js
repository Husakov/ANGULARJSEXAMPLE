module.exports = function (module) {
    const templateUrl = require('./index.html');
    require('./listTableHeader.scss');

    class Controller {
        constructor(attributesHelper, $scope) {
            'ngInject';

            this.attributesHelper = attributesHelper;
            this.$scope = $scope;
            this.loading = true;
        }

        $onInit() {
            this.setCategories();
            this.$scope.$watch(() => this.getParam('mode'), () => this.setCategories());
        }

        setCategories() {
            if (this.getParam('mode')) {
                this.loading = true;
                this.attributesHelper
                    .getAttributesByCategories(this.getParam('mode'))
                    .then(categories => {
                        let names;
                        if (this.main.isCompanies()) {
                            names = ['companyAttributes', 'customAttributes'];
                        } else {
                            names = ['userAttributes', 'companyAttributes', 'customAttributes', 'mobileAttributes'];
                        }
                        this.categories = _.pick(categories, names);
                        this.main.setHeaderAttributes(this.attributesHelper.getVisible(this.categories));
                        this.loading = false;
                    });
            }
        }

        getParam(prop) {
            return _.get(this.main, `params.${prop}`);
        }

        isMaxColumns() {
            if (this.maxColumns) {
                return this.main.headerAttributes.length > (this.maxColumns - 1);
            } else {
                return false
            }
        }

        isDisabledColumn(column) {
            return (this.isMaxColumns() && !column.visible) || (!column.allowHide && column.visible)
        }

        toggleVisible() {
            this.attributesHelper.setVisible(this.categories, this.getParam('mode'));
            this.main.setHeaderAttributes(this.attributesHelper.getVisible(this.categories));
        }
    }

    module
        .component('contactsListTableHeaders', {
            templateUrl,
            controller: Controller,
            bindings: {
                main: '<',
                maxColumns: '<?'
            }
        });
};
