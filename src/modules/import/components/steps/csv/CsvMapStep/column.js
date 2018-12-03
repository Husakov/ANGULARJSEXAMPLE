module.exports = function (module) {

    class Controller {
        constructor($scope) {
            'ngInject';
            this.$scope = $scope;
        }

        $onInit() {
            this.helper = this.parent.helper;
            this.helper.on('update', ($e, col) => {
                if (col === this.column) {
                    this.$scope.$broadcast('recompile');
                }
            }, this.$scope);
        }

        toggle(state) {
            this.helper.toggle(this.column, state);
        }

        confirm() {
            this.helper.map(this.column);
        }
    }

    module
        .component('importCsvCsvMapColumn', {
            templateUrl: require('./column.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                column: '='
            },
            require: {
                parent: '^importCsvCsvMapStep'
            }
        });
};
