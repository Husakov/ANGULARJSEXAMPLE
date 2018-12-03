module.exports = function (module) {
    require('./datetime.scss');

    class Controller {
        constructor($scope) {
            'ngInject';

            $scope.$watch(() => this.date, () => this.bindToModel());
        }

        $onInit() {
            this.ngModelCtrl.$parsers.push((date) => {
                if (this.isEnabled) {
                    return date.toISOString();
                }
            });

            this.ngModelCtrl.$formatters.push((value) => {
                this.isEnabled = !isNaN(Date.parse(value));
                this.date = this.isEnabled ? this.formatDate(value) : this.formatDate(new Date());
                return this.date;
            });
        }


        formatDate(value) {
            let date = new Date(value);
            return new Date(date.getFullYear(), date.getMonth(), date.getDay(), date.getHours(), date.getMinutes());
        }

        changeMode() {
            if (this.isEnabled) {
                this.date = this.date ? this.formatDate(this.date) : this.formatDate(new Date());
            } else {
                this.date = null;
            }
        }

        bindToModel() {
            this.ngModelCtrl.$setViewValue(this.date);
            this.ngModelCtrl.$commitViewValue();
        }

        toggleDatePicker(value = this.isDatepickerOpen) {
            this.isDatepickerOpen = value;
        }
    }

    module
        .component('messagesDatetimeOptions', {
            templateUrl: require('./index.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            require: {
                ngModelCtrl: 'ngModel'
            },
            bindings: {
                name: '@'
            }
        });
};
