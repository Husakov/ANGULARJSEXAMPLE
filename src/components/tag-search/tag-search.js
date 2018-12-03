require('./tag-search.scss');

function getTagDifference(tags, selected) {
    let selectedIds = _(selected)
        .compact()
        .pluck('id')
        .values();

    return tags.filter(tag => !selectedIds.includes(tag.id));
}

class Controller {
    constructor(Tags, $element, $state, $window) {
        'ngInject';

        this.Tags = Tags;
        this.$element = $element;
        this.$state = $state;
        this.$window = $window;
        this.selected = !_.isEmpty(this.existed) ? angular.copy(this.existed) : [];

        this.setTags();

        this.search = '';

        this.loading = false;
    }

    $onChanges() {
        this.selected = !_.isEmpty(this.existed) ? angular.copy(this.existed) : [];
        if (this.allTags) {
            this.tags = getTagDifference(this.allTags, this.selected);
        }
    }

    $onDestroy() {
        if (this.collectionChanged) {
            this.Tags.clearCache();
        }
    }

    onManageTags() {
        const url = this.$state.href('settings.tags-segments.tags');
        this.$window.open(url, '_blank');
    }

    setTags() {
        this.Tags.query({limit: 0}).$promise.then(tags => {
            this.allTags = tags;
            this.tags = getTagDifference(tags, this.selected);
        });
    }

    selectTag(tag) {
        _.pull(this.tags, tag);
        this.selected.push(tag);
    }

    unselectTag(tag) {
        _.pull(this.selected, tag);
        this.tags.push(tag);
    }

    addNewTag(tagName) {
        this.collectionChanged = true;
        let tag = new this.Tags({name: tagName});
        this.search = '';
        return tag
            .$save()
            .then(tag => {
                this.Tags.clearCache();
                this.setTags();
                return tag;
            })
            .then(this.selectTag.bind(this));
    }

    onKeyDown(event) {
        if (event.keyCode === 8 && _.isEmpty(this.search)) {
            this.unselectTag(this.selected.pop());
        }

        if (event.keyCode === 13 && !_.isEmpty(this.search) && this.$element.find('.active-navigation-item').length > 0) {
            this.addNewTag(this.search);
        }
    }

    apply() {
        if (!_.isEmpty(this.search)) {
            this.loading = true;
            this.addNewTag(this.search)
                .then(() => this.loading = false)
                .then(() => this.done({tags: this.selected}));
        } else {
            this.done({tags: this.selected});
        }
    }
}

module.exports = angular.module('intercom.components.tagSearch', [])
    .component('tagSearch', {
        templateUrl: require('./tag-search.html'),
        controller: Controller,
        bindings: {
            existed: '<',
            done: '&'       //function use extractor with interface {tags: values}
        }
    });
