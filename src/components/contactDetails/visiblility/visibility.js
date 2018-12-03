module.exports = function (module) {
    class Controller {
        constructor(Profile, ProfileVisibilities) {
            'ngInject';
            this.Profile = Profile;
            this.ProfileVisibilities = ProfileVisibilities;


            this.segments = this.segments || [];

            this.currentUser = Profile.get();
        }

        $onChanges({items}) {
            if (items && items.currentValue) {
                this.updateItems();
            }
        }

        updateItems() {
            let visibleIds = this.currentUser[this.property] || [];

            this.visibleItems = [];
            this.hiddenItems = [];
            this.items.forEach(item => {
                if (visibleIds.includes(item.id)) {
                    this.visibleItems.push(item);
                } else {
                    this.hiddenItems.push(item);
                }
            });
        }

        changeVisibility(item, show) {
            this.ProfileVisibilities.save(this.type, [{id: item.id, enabled: show}])
                .then(currentUser => {
                    this.currentUser = currentUser;
                    this.updateItems();
                });
        }

    }

    module
        .component('contactDetailsVisibility', {
            templateUrl: require('./index.html'),
            controller: Controller,
            bindings: {
                visibility: '=',
                property: '<',
                items: '<',
                type: '<'
            }
        });
};
