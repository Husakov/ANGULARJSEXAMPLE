module.exports = function (module) {
    require('./search.scss');

    function contains($element, $child) {
        let $parent = $child.parent();
        while ($parent && $parent.length) {
            if ($element.is($parent)) {
                return true;
            }
            $parent = $parent.parent();
        }
        return false;
    }

    class Controller {
        constructor($scope, $element, $document) {
            'ngInject';
            this.$element = $element;
            this.$document = $document;

            this.isOpen = false;

            this.category = null;

            let off = $scope.$watch(() => this.attributeCategories, () => {
                if (this.attributeCategories && !this.category) {
                    let key = Object.keys(this.attributeCategories)[0];
                    this.category = this.attributeCategories[key];
                }
                if (this.category) {
                    off();
                }
            });

            this.handler = ($e) => {
                if (!contains(this.$element, angular.element($e.target))) {
                    this.toggle(false);
                }
            };
            this.$document.on('mousedown', this.handler);
        }

        $onDestroy() {
            this.$document.off('mousedown', this.handler);
        }

        toggle(state = !this.isOpen) {
            if (state === this.isOpen) {
                return;
            }
            this.isOpen = state;
            this.$element.toggleClass('open', state);
        }

        selectCategory(category) {
            this.category = category;
        }

        select(item) {
            this.toggle(false);
            this.onSelect({$attribute: item});
        }

        attributesFilter(item) {
            return item.name !== 'role';
        }
    }

    module.component('usersFilterSearch', {
        templateUrl: require('./index.html'),
        controller: Controller,
        bindings: {
            attributeCategories: '<',
            onSelect: '&'
        }
    });
};
