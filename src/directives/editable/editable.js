module.exports = function (module) {
    const templateUrl = require('./editable.html');
    require('./editable.scss');

    module
        .directive('editable', function ($timeout) {
            'ngInject';

            class Controller {
                constructor($element, $scope) {
                    'ngInject';
                    this.$element = $element;
                    this.isEdit = false;
                    this.$scope = $scope;
                    this.outSideControlOn = false;
                }

                $onInit() {
                    if (_.has(this, 'isEditOutside')) {
                        this.outSideControlOn = true;
                        this.$scope.$watch('$editableCtrl.isEditOutside', (value = false) => {
                            if (value !== this.isEdit) {
                                this.toggle(value);
                            }
                        })
                    }
                    this.initValue();
                }

                $onChanges() {
                    this.initValue();
                }

                initValue() {
                    this.value = angular.copy(this.originValue);
                }

                toggle(isEdit = !this.isEdit) {
                    if (this.isEdit === isEdit) {
                        return;
                    }
                    this.initValue();
                    if (isEdit) {
                        $timeout(() => {
                            this.$element.find('input').focus();
                        });
                    }
                    this.isEdit = isEdit;
                    if (this.outSideControlOn) {
                        this.isEditOutside = isEdit;
                    }
                }

                save() {
                    this.set({$value: this.value});
                    this.toggle();
                }

                keyUp($event) {
                    switch ($event.keyCode) {
                        case 13:
                            this.save();
                            break;
                        case 27:
                            this.toggle();
                            break;
                        default:
                            break;
                    }
                }

                onBlur() {
                    if (this.saveOnBlur) {
                        this.set({$value: this.value});
                        this.toggle(false);
                    } else {
                        this.toggle(false);
                    }
                }
            }

            return {
                restrict: 'A',
                scope: {
                    placeholder: '@',
                    originValue: '<editable',
                    set: '&editableSet',
                    isEditOutside: '=?isEdit',
                    saveOnBlur: '=?saveOnBlur'
                },
                controller: Controller,
                controllerAs: '$editableCtrl',
                bindToController: true,
                require: 'editable',
                templateUrl
            };
        });
};
