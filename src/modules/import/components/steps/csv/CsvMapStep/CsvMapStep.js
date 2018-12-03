module.exports = function (module) {
    const Step = require('../../Step');

    class Controller extends Step {
        constructor($element, $scope, $attrs, Import, ImportCsvCsvMapHelper, importStateManager) {
            'ngInject';
            super($element);
            this.$scope = $scope;
            this.Import = Import;
            this.Helper = ImportCsvCsvMapHelper;
            this.stepManager = importStateManager;

            this.description = 'Map column in your .csv';
            this.className = 'csv-map-step';

            this.isInited = false;
            this.index = $attrs.index;
        }

        init() {
            this.helper = new this.Helper(
                this.model.recipients,
                this.model.fileData.preview_columns,
                () => {
                    this.done();
                }
            );

            this.$scope.$watch(() => this.helper.index, () => {
                this.stepManager.setSubStep(this.helper.index + 1);
            });

            let off = this.stepManager.on('state', ($e, [parentIndex, index = -1]) => {
                if (!this.isInited || parentIndex !== this.index) {
                    return;
                }
                if (!this.helper.goTo(index - 1)) {
                    this.stepManager.setSubStep(this.helper.index + 1);
                }
            });

            this.$onDestroy = () => {
                off();
            };

            this.$scope.$broadcast('recompile');
            this.isInited = true;
        }

        next() {
            return this.Import
                .CSV
                .assignColumns(
                    {id: this.model.fileData.id},
                    {column_assignments: this.helper.getAssignments()}
                )
                .$promise
                .then();
        }

        validate() {
            return this.helper.isValid;
        }
    }

    module
        .component('importCsvCsvMapStep', {
            templateUrl: require('./index.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                onReady: '&',
                index: '@',
                model: '=',
                done: '&'
            }
        });
};
