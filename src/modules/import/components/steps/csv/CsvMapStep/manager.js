module.exports = function (module) {

    function getCenterOffset($container, $element) {
        let contOffset = $container.offset(),
            elOffset = $element.offset(),
            sizes = {
                width: $container.width(),
                height: $container.height()
            },
            d = {
                top: elOffset.top - contOffset.top,
                left: elOffset.left - contOffset.left
            },
            center = {
                top: parseInt(sizes.height / 2, 10),
                left: parseInt(sizes.width / 2, 10)
            };
        return {
            top: (center.top - d.top) + 'px',
            left: (center.left - d.left) + 'px'
        };
    }

    class Controller {
        constructor($element) {
            'ngInject';
            this.$element = $element;
            this.isSelected = false;
        }

        $onInit() {
            this.helper = this.parent.helper;
            this.helper.on('toggle', ($e, ...args) => this.toggle(...args));
            this.$wrapper = this.$element.find('.csv-substep-wrapper');
        }

        toggle(col, state) {
            this.$columns
                .filter('.selected')
                .css({'left': 0, 'top': 0})
                .removeClass('selected');

            if (state) {
                this.$columns
                    .eq(col.index)
                    .addClass('selected')
                    .css(getCenterOffset(this.$wrapper, this.$holders.eq(col.index)));
            }
            this.isSelected = state;
        }

        initElements() {
            this.$columns = this.$element.find('.col-item');
            this.$holders = this.$element.find('.col-item-wrapper');
        }
    }

    module
        .component('importCsvCsvMapManager', {
            templateUrl: require('./manager.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            require: {
                parent: '^importCsvCsvMapStep'
            }
        });
};
