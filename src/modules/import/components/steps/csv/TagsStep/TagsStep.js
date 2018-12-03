module.exports = function (module) {
    const Step = require('../../Step');
    const constants = require('../constants');

    class Controller extends Step {
        constructor($element, $scope, slidePanelManager, Import, $q) {
            'ngInject';
            super($element);
            this.Import = Import;
            this.$q = $q;

            this.description = 'Tag imported users';
            this.className = 'tags-step';
            
            this.help = constants.tagsHelp;

            this.tagPanel = slidePanelManager.render({
                template: '<tag-search done="$ctrl.resolveTags({tags: tags})" existed="$ctrl.tags"></tag-search>',
                background: true,
                slideAppContainer: true,
                $scope: $scope.$new()
            });

            this.tags = [];
        }

        resolveTags({tags}) {
            this.tagPanel.toggle(false);
            this.tags = tags;
        }

        next() {
            let promise = this.$q.resolve(),
                id = this.model.fileData.id;
            if (this.tags.length > 0) {
                promise = this.Import
                    .CSV
                    .setTags(
                        {id},
                        {tags: _.pluck(this.tags, 'id')}
                    )
                    .$promise
            }

            promise = promise
                .then(() => this.Import.CSV.launch({id}).$promise);

            return promise;
        }
    }

    module
        .component('importCsvTagsStep', {
            templateUrl: require('./index.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                onReady: '&',
                model: '='
            }
        });
};
