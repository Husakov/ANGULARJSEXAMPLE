module.exports = function (module) {
    module
        .directive('uploadFileDrop', function ($window) {
            'ngInject';
            angular.element($window).on('drop dragover', stopEvent);

            const elementClass = 'upload-file-drop',
                overClass = 'file-over';

            function stopEvent($event) {
                $event.stopPropagation();
                $event.preventDefault();
                return false;
            }

            class Controller {

            }

            class ClassHelper {
                constructor($element) {
                    this.$element = $element;
                    this.count = 0;
                }

                enter() {
                    this.count++;
                    this.update();
                }

                leave() {
                    this.count--;
                    this.update();
                }

                reset() {
                    this.count = 0;
                    this.update();
                }

                update() {
                    if (this.count > 0) {
                        this.$element.addClass(overClass);
                    } else {
                        this.$element.removeClass(overClass);
                    }
                }
            }

            return {
                restrict: 'A',
                controller: Controller,
                scope: {
                    onSelect: '&?'
                },
                bindToController: true,
                link: function ($scope, $element, $attrs, $ctrl) {
                    const classHelper = new ClassHelper($element);
                    $element.addClass(elementClass);

                    $element.on('drag dragstart dragend dragover dragenter dragleave drop', stopEvent);
                    $element.on('dragenter', () => classHelper.enter());
                    $element.on('dragleave', () => classHelper.leave());
                    $element.on('drop', ($event) => {
                        classHelper.reset();
                        $ctrl.onSelect({file: $event.originalEvent.dataTransfer.files[0]});
                    });
                }
            };
        });
};
