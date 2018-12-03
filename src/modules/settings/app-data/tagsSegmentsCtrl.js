let baseParams = {
    limit: 25,
    include_count: true
};

module.exports = class Controller {
    constructor(ProfileVisibilities, pubSub, $state, $timeout, dialogs, Segment, Tags, notifier, $scope) {
        'ngInject';
        this.resource = ProfileVisibilities;
        this.$timeout = $timeout;
        this.dialogs = dialogs;
        this.Segment = Segment;
        this.Tags = Tags;
        this.type = $state.current.data.type;
        this.$scope = $scope;
        this.notifier = notifier;
        this._recordsToSave = [];
        this.tabs = [
            {
                state: 'settings.tags-segments.contacts-segments',
                icon: 'fa-users',
                title: 'Contact Segments'
            },
            {
                state: 'settings.tags-segments.company-segments',
                icon: 'fa-building',
                title: 'Company Segments'
            },
            {
                state: 'settings.tags-segments.tags',
                icon: 'fa-tags',
                title: 'Tags'
            }
        ];

        this.clearCacheAndReload();

        pubSub.onStateChanged(() => {
            this.type = $state.current.data.type;
            this.clearCacheAndReload()
        }, $scope);
    }

    setParams() {
        if (this.type === 'tags') {
            this.params = angular.merge({include_used_counts: true}, baseParams);
        } else {
            this.params = angular.merge({}, baseParams);
        }
    }

    fetch(helperParams) {
        let params = _.assign({}, this.params, helperParams);
        return this.resource.get(this.type, params).$promise;
    }

    clearCacheAndReload() {
        if (this.type) {
            this.Tags.clearCache();
            this.Segment.clearCache();

            this.params = null;
            this.listHelper = null;
            this.setParams();
            this.$scope.$broadcast('scroll-list.reset');
        }
    }

    updateVisibility(record, status = !record.enabled) {
        record.enabled = status;
        this.addToSave(record);
    }

    addToSave(record) {
        let index = _.findIndex(this._recordsToSave, {id: record.id});
        index = index !== -1 ? index : this._recordsToSave.length;
        this._recordsToSave[index] = record;

        if (angular.isDefined(this._recordsToSave.timeoutId)) {
            this.$timeout.cancel(this._recordsToSave.timeoutId);
        }

        this._recordsToSave.timeoutId = this.$timeout(() => {
            this.resource.save(this.type === 'tags' ? 'tags' : 'segments', this._recordsToSave);
            this._recordsToSave = [];
        }, 1000);
    }

    save(el, newvalue) {
        if (el.name !== newvalue) {
            let successText;
            el.name = newvalue;
            if (this.type === 'tags') {
                successText = 'Tag was successfully changed';
            } else {
                successText = 'Segment was successfully changed';
            }
            el.$update().then(() => {
                this.notifier.success(successText);
                this.clearCacheAndReload();
            });
        }
    }

    remove(el) {
        let title,
            questionText,
            successText,
            resource;
        if (this.type === 'tags') {
            title = 'Tag "' + el.name + '"';
            questionText = 'Are you sure you want to delete this tag?';
            successText = 'Tag was successfully removed.';
            resource = this.Tags;
        } else {
            title = 'Segment "' + el.name + '"';
            questionText = 'Are you sure you want to delete this segment?';
            successText = 'Segment was successfully removed.';
            resource = this.Segment;
        }
        this.dialogs
            .confirm({
                title: title,
                body: questionText
            })
            .then(() => {
                resource.delete({id: el.id})
                .$promise
                .then(() => {
                    this.notifier.success(successText);
                    this.clearCacheAndReload();
                })
            });
    }
};
