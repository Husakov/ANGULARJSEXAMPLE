module.exports = function (mod) {

    require('./menu.scss');

    class Controller {
        constructor(Admin, $scope, $element, $timeout) {
            'ngInject';
            this.$element = $element;
            this.$timeout = $timeout;

            this.admins = Admin.query();
            $scope.$on('mention.search', ($e, text) => this.search(text));
            $scope.$on('mention.move', ($e, isNext) => this.move(isNext));
            $scope.$on('mention.select', () => this.selectActive());
        }

        filter(text) {
            return this.admins.filter(a => a.name.toLowerCase().indexOf(text.toLowerCase()) >= 0);
        }

        search(text) {
            this.items = this.filter(text);
            this.typedTerm = text;
            this.$timeout(() => {
                this.$elements = this.$element.find('a');
                if (this.$elements.filter('.active').length === 0) {
                    this.$elements.eq(0).addClass('active');
                }
            });
        }

        move(isNext) {
            this.$elements = this.$element.find('a');
            let active = this.$elements.filter('.active');
            active.removeClass('active');
            if (isNext) {
                active = active.next();
            } else {
                active = active.prev();
            }

            if (active.length === 0) {
                active = isNext ? this.$element.find('a:first') : this.$element.find('a:last')
            }
            active.addClass('active');
        }

        selectActive() {
            let active = this.$elements.filter('.active');
            if (active.length !== 0) {
                active.click();
            }
        }
    }

    mod.component('textEditorMentionsMenu', {
        controller: Controller,
        templateUrl: require('./menu.html'),
        bindings: {
            select: '&'
        }
    });
};
