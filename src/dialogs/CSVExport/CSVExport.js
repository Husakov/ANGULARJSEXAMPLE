const templateUrl = require('./index.html');

require('./csvExport.scss');

class Controller {
    constructor($scope, options, Export) {
        'ngInject';
        this.$scope = $scope;

        Object.keys(options).forEach((key) => {
            this[key] = options[key];
        });

        this.Export = Export;

        this.exportAll = false;

        this.count = this.records.length;

        this.exportTypes = [{
            name: 'Export with the currently displayed columns.',
            value: false
        }, {
            name: 'Export with all columns.',
            value: true
        }];

        this.loading = false;
    }

    ok() {
        let data = {
            all_attributes: this.exportAll,
            export_type: this.recordsType
        };

        if (this.count > 0) {
            data.query_type = 'ids';
            data.included_ids = _.pluck(this.records, 'id');
        } else {
            data.query_type = 'predicstes';
            data.predicates = this.predicates;
        }

        this.loading = true;
        this.Export.csvExport({}, data)
            .$promise
            .then(() => this.loading = false)
            .then(() => this.$scope.$close(true))
            .catch(() => this.$scope.$close(false));
    }
}

module.exports = {
    name: 'CSVExport',
    open: function ($uibModal, options) {
        return $uibModal.open({
            templateUrl: templateUrl,
            controllerAs: '$ctrl',
            windowClass: 'csv-export',
            controller: Controller,
            resolve: {
                options
            }
        }).result;
    }
};
