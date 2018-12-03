let templateUrl = require('./index.html');
require('./emojDropdown.scss');

class Controller {

    constructor(emojis, $element, $scope) {
        'ngInject';

        this.isModel = false;
        this.search = '';

        this.emojis = emojis.list;
        $element.addClass('inline');

        $scope.$watch(() => this.search, () => {
            if (this.search.length) {
                this.emojis = emojis.filter(this.search);
            } else {
                this.emojis = emojis.list;
            }
        });
    }

    $onInit() {
        if (_.has(this, 'model')) {
            this.isModel = true;
        } else {
            this.model = 'fake';
        }

        if (_.isUndefined(this.onSelect)) {
            this.onSelect = () => {};
        }
    }

    onSelectEmotion(emo) {
        this.isOpen = false;
        if (this.isModel) {
            this.model = emo;
        }
        this.onSelect({emotion: emo});
    }
}

module.exports = angular.module('intercom.components.emojDropdown', [])
    .component('emojDropdown', {
        templateUrl: templateUrl,
        controller: Controller,
        bindings: {
            model: '=?ngModel',
            isModel: '=?',
            onSelect: '&',
            isOpen: '=?',
            isDisabled: '<?'
        }
    });
