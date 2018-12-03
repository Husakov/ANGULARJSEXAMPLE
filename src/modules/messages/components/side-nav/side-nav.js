module.exports = function (module) {
    require('./side-nav.scss');

    function setState(section, state = false) {
        section.active = state;

        if (state && section.action) {
            section.action();
            return;
        }

        if (state) {
            (section.onEnter || angular.noop)();
        } else {
            (section.onExit || angular.noop)();
        }
    }

    class Controller {
        constructor($scope, dialogs, notifier) {
            'ngInject';
            this.$scope = $scope;
            this.dialogs = dialogs;
            this.notifier = notifier;

            this.init();

            $scope.$on('$destroy', () => this.destroy());
            $scope.$on('sideNav.clearState', ($e) => {
                this.clearState();
                $e.stopPropagation();
            });

            this.setDefaultActive(this.sections.items);
        }

        init() {
            this.activeSections = [];
        }

        setActive(section, level) {
            if (section && section.items) {
                this.collapsed = false;
            }

            if (section && section.active) {
                return;
            }

            this.activeSections
                .splice(level, this.activeSections.length)
                .forEach(i => setState(i));
            if (section) {
                setState(section, true);
                this.activeSections.push(section);
            }

            this.activeSection = section;
        }

        toggleSidebar() {
            this.collapsed = !this.collapsed
        }

        setDefaultActive(items) {
            items.forEach(item => {
                if (item.defaultActive) {
                    this.setActive(item);
                }
            });
        }

        clearState() {
            setState(this.activeSection, false);
        }

        destroy() {
            this.setActive();
        }

        getTemplateUrl(name) {
            return this.templates[name];
        }
    }

    module
        .component('messagesSidenav', {
            templateUrl: require('./index.html'),
            transclude: {
                left: '?messagesSidenavLeft'
            },
            bindings: {
                mediator: '=',
                sections: '=',
                templates: '='
            },
            controller: Controller
        });
};
